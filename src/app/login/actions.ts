"use server";

import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { SECRET_KEY } from "@/lib/constants";
import { getIronSessionData } from "@/lib/session";
import { saveClientId, updateLuoguUserSummary } from "@/lib/luogu";
import {
  formSchema,
  type FormSchema,
  verificationLoginFormSchema,
} from "./schemas";

type FormState = { message: string } | undefined;

function redirectToAuthorize(query: string, uid: number) {
  const urlSearchParams = new URLSearchParams(query);
  urlSearchParams.set(
    "uid",
    jwt.sign({ uid }, SECRET_KEY, { expiresIn: "30s" }),
  );

  redirect(`/authorize?${urlSearchParams}`);
}

async function saveUser(uid: number) {
  const session = await getIronSessionData();
  session.saved = Array.from(new Set(session.saved).add(uid));
  await session.save();
}

export async function loginWithClientId(
  query: string,
  prevState: FormState,
  formData: FormSchema,
): Promise<FormState> {
  const { uid, clientId } = await formSchema.parseAsync(formData);
  if (!(await saveClientId(uid, clientId))) return { message: "登录失败" };
  await saveUser(uid);
  redirectToAuthorize(query, uid);
}

export const generateToken = async (): Promise<string> =>
  // TODO: code generator
  Promise.resolve(jwt.sign({ txt: "Hello" }, SECRET_KEY, { expiresIn: "1m" }));

export async function loginWithVerification(
  query: string,
  token: string,
  prevState: FormState,
  formData: z.infer<typeof verificationLoginFormSchema>,
): Promise<FormState> {
  const { uid } = await verificationLoginFormSchema.parseAsync(formData);
  const { txt: code } = await z
    .object({ txt: z.string() })
    .parseAsync(jwt.verify(token, SECRET_KEY));

  const user = await updateLuoguUserSummary(uid);
  if (!user) return { message: "用户不存在" };
  if (!user.introduction?.includes(code)) return { message: "未找到验证码" };
  await saveUser(uid);
  redirectToAuthorize(query, uid);
}

export async function select(query: string, uid: number) {
  const session = await getIronSessionData();
  if (!session.saved.includes(uid))
    throw new Error("User not found in saved list");

  redirectToAuthorize(query, uid);
}
