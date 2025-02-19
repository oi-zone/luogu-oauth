import { NextResponse, type NextRequest } from "next/server";
import { responseToVanilla } from "@jmondi/oauth2-server/vanilla";
import jwt from "jsonwebtoken";

import authorizationServer, {
  requestFromNext,
} from "@/lib/authorization-server";
import { SECRET_KEY } from "@/lib/constants";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  // https://github.com/vercel/next.js/issues/72909
  if (request.headers.get("rsc")) return new NextResponse();

  try {
    const authRequest = await authorizationServer.validateAuthorizationRequest(
      await requestFromNext(request),
    );

    if (!request.nextUrl.searchParams.has("uid")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      url.searchParams.set("query", request.nextUrl.searchParams.toString());
      return NextResponse.redirect(url);
    }

    const { uid } = jwt.verify(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      request.nextUrl.searchParams.get("uid")!,
      SECRET_KEY,
    ) as { uid: number };
    authRequest.user = {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      id: (await prisma.luoguUser.findUnique({ where: { uid } }))!.uid,
    };

    authRequest.isAuthorizationApproved = true;
    const oauthResponse =
      await authorizationServer.completeAuthorizationRequest(authRequest);
    return responseToVanilla(oauthResponse);
  } catch (error) {
    return new Response((error as Error).message, {
      status: 400,
    });
  }
}
