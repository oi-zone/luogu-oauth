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
import { customAlphabet } from "nanoid";

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

export const generateToken = async (): Promise<string> => {
  const ALPHABET =
    "天地玄黄宇宙洪荒日月盈昃辰宿列张寒来暑往秋收冬藏闰余成岁律吕调阳云腾致雨露结为霜金生丽水玉出昆冈剑号巨阙珠称夜光果珍李柰菜重芥姜海咸河淡鳞潜羽翔龙师火帝鸟官人皇始制文字乃服衣裳推位让国有虞陶唐吊民伐罪周发殷汤坐朝问道垂拱平章爱育黎首臣伏戎羌遐迩一体率宾归王鸣凤在树白驹食场化被草木赖及万方";
  const token = customAlphabet(ALPHABET, 12)();
  return Promise.resolve(
    jwt.sign(
      {
        txt: `${token.substring(0, 4)}，${token.substring(4, 8)}，${token.substring(8, 12)}。`,
      },
      SECRET_KEY,
      { expiresIn: "1m" },
    ),
  );
};

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
