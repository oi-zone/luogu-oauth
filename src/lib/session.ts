import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";

import { SECRET_KEY } from "./constants";

export const sessionOptions: SessionOptions = {
  password: SECRET_KEY,
  cookieName: "session",
  cookieOptions: {
    // secure only works in `https` environments
    // if your localhost is not on `https`, then use: `secure: process.env.NODE_ENV === "production"`
    secure: process.env.NODE_ENV === "production",
  },
};

export interface SessionData {
  saved: number[];
}

export async function getIronSessionData() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  session.saved ??= [];

  return session;
}
