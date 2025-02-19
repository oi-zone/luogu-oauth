import { type NextRequest } from "next/server";
import { responseToVanilla } from "@jmondi/oauth2-server/vanilla";

import authorizationServer, {
  requestFromNext,
} from "@/lib/authorization-server";

export const POST = async (request: NextRequest) =>
  authorizationServer
    .respondToAccessTokenRequest(await requestFromNext(request))
    .then((oauthResponse) => responseToVanilla(oauthResponse))
    .catch(
      (error: unknown) =>
        new Response((error as Error).message, { status: 400 }),
    );
