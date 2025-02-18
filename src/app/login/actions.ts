"use server";

import { randomInt } from "crypto";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { z } from "zod";
import {
  SECRET_KEY,
  VERIFICATION_CODE_EXPIRES_IN,
  VERIFICATION_CODE_REFRESH_INTERVAL,
} from "@/lib/constants";
import { getIronSessionData } from "@/lib/session";
import { saveClientId, updateLuoguUserSummary } from "@/lib/luogu";
import type { LoginFormState } from "@/hooks/use-login-form";
import ALPHABET from "@/lib/thousand-character-classic.json";
import { formSchema, verificationLoginFormSchema } from "./schemas";

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
  prevState: LoginFormState,
  formData: z.infer<typeof formSchema>,
): Promise<LoginFormState> {
  const { uid, clientId } = await formSchema.parseAsync(formData);
  if (!(await saveClientId(uid, clientId))) return { message: "登录失败" };
  await saveUser(uid);
  redirectToAuthorize(query, uid);
}

function generateTokenFragment(alphabet: string, size: number): string {
  let maxSeed = alphabet.length;
  for (let i = 1; i < size; i++) maxSeed *= alphabet.length - i;

  let seed = randomInt(maxSeed);
  let result = "";

  for (let i = 0; i < size; i++) {
    const curChar = alphabet[seed % alphabet.length];
    result += curChar;
    seed = Math.floor(seed / alphabet.length);
    alphabet = alphabet
      .split("")
      .filter((c) => c != curChar)
      .join("");
  }

  return result;
}

export const generateToken = async (): Promise<string> => {
  const tokenFrag1 = generateTokenFragment(ALPHABET, 4);
  const tokenFrag2 = generateTokenFragment(
    ALPHABET.split("")
      .filter((c) => !tokenFrag1.includes(c))
      .join(""),
    4,
  );

  return Promise.resolve(
    jwt.sign(
      {
        txt: `${tokenFrag1}，${tokenFrag2}。`,
        refresh: VERIFICATION_CODE_REFRESH_INTERVAL,
      },
      SECRET_KEY,
      { expiresIn: VERIFICATION_CODE_EXPIRES_IN },
    ),
  );
};

const verificationJwtSchema = z
  .array(z.string())
  .transform((tokens) =>
    tokens
      .map((token) => {
        try {
          return jwt.verify(token, SECRET_KEY);
        } catch {
          return null;
        }
      })
      .filter(Boolean),
  )
  .pipe(z.array(z.object({ txt: z.string() })));

export async function loginWithVerification(
  tokens: string[],
  query: string,
  prevState: LoginFormState,
  formData: z.infer<typeof verificationLoginFormSchema>,
): Promise<LoginFormState> {
  const { uid } = await verificationLoginFormSchema.parseAsync(formData);
  const codes = await verificationJwtSchema.parseAsync(tokens);

  const user = await updateLuoguUserSummary(uid, 0);
  if (!user) return { message: "用户不存在" };
  const { introduction } = user;
  if (!introduction || !codes.some(({ txt }) => introduction.includes(txt)))
    return { message: "未找到验证码" };

  await saveUser(uid);
  redirectToAuthorize(query, uid);
}

export async function select(query: string, uid: number) {
  const session = await getIronSessionData();
  if (!session.saved.includes(uid))
    throw new Error("User not found in saved list");

  redirectToAuthorize(query, uid);
}
