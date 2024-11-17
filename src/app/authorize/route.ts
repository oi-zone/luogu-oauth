import { NextResponse, type NextRequest } from "next/server";
import {
  requestFromVanilla,
  responseToVanilla,
} from "@jmondi/oauth2-server/vanilla";
import authorizationServer from "@/lib/authorization-server";

export async function GET(request: NextRequest) {
  try {
    const authRequest = await authorizationServer.validateAuthorizationRequest(
      await requestFromVanilla(request),
    );
    console.log(authRequest);

    const uid = request.nextUrl.searchParams.get("uid");
    if (!uid) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    authRequest.user = { id: uid };

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
