"use server";

import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import { SECRET_KEY } from "@/lib/constants";
import { getIronSessionData } from "@/lib/session";

export async function login(uid: number, next: string) {
  const session = await getIronSessionData();
  if (!session.saved.includes(uid))
    throw new Error("User not found in saved list");

  const url = new URL(next);
  url.searchParams.set(
    "uid",
    jwt.sign({ uid }, SECRET_KEY, { expiresIn: "30s" }),
  );
  redirect(url.toString());
}
