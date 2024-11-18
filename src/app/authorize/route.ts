import { NextResponse, type NextRequest } from "next/server";
import {
  requestFromVanilla,
  responseToVanilla,
} from "@jmondi/oauth2-server/vanilla";
import authorizationServer from "@/lib/authorization-server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  // https://github.com/vercel/next.js/issues/72909
  if (request.headers.get("rsc")) return new NextResponse();

  try {
    const authRequest = await authorizationServer.validateAuthorizationRequest(
      await requestFromVanilla(request),
    );

    const uid = request.nextUrl.searchParams.get("uid");
    if (!uid) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    const cookieStore = await cookies();
    const clientId = cookieStore.get(uid)?.value;
    authRequest.user = { id: uid, clientId };

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
