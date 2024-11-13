import type { NextApiRequest, NextApiResponse } from "next";
import Provider from "oidc-provider";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const oidc = new Provider(process.env.ISSUER!);
const callback = oidc.callback();

interface ApiRequest extends NextApiRequest {
  originalUrl?: string;
}

export default function handler(req: ApiRequest, res: NextApiResponse) {
  req.originalUrl = req.url;
  req.url = req.url?.replace(/^\/api\/oidc\//, "/");

  return callback(req, res);
}
