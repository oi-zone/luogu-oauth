"use server";

import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "@/lib/constants";
import { getIronSessionData } from "@/lib/session";
import { saveClientId } from "@/lib/luogu";
import { formSchema, type FormSchema } from "./schemas";

type FormState = { message: string } | undefined;

function redirectToAuthorize(query: string, uid: number) {
  const urlSearchParams = new URLSearchParams(query);
  urlSearchParams.set(
    "uid",
    jwt.sign({ uid }, SECRET_KEY, { expiresIn: "30s" }),
  );

  redirect(`/authorize?${urlSearchParams}`);
}

export async function loginWithClientId(
  query: string,
  prevState: FormState,
  formData: FormSchema,
): Promise<FormState> {
  const { uid, clientId } = await formSchema.parseAsync(formData);

  if (!(await saveClientId(uid, clientId))) return { message: "登录失败" };

  const session = await getIronSessionData();
  session.saved = Array.from(new Set(session.saved).add(uid));
  await session.save();

  redirectToAuthorize(query, uid);
}

export async function select(query: string, uid: number) {
  const session = await getIronSessionData();
  if (!session.saved.includes(uid))
    throw new Error("User not found in saved list");

  redirectToAuthorize(query, uid);
}
