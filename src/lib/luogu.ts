import type { UserSummary } from "luogu-api-docs/luogu-api";
import prisma from "@/lib/prisma";

export const getLuoguUserAvatar = (uid: number) =>
  `https://cdn.luogu.com.cn/upload/usericon/${uid.toString()}.png`;

export async function updateLuoguUserSummary(uid: number) {
  const user = await prisma.luoguUser.findUnique({
    where: { uid, updatedAt: { gte: new Date(Date.now() - 3600000) } },
  });
  if (user) return user;
  const url = new URL("https://www.luogu.com.cn/api/user/search");
  url.searchParams.set("keyword", uid.toString());
  const response = await fetch(url, {
    headers: { "x-luogu-type": "content-only" },
  });
  const userSummary = (
    (await response.json()) as { users: [UserSummary | null] }
  ).users[0];
  if (!userSummary) return null;
  const userInput = { ...userSummary, isRoot: userSummary.isRoot ?? false };
  return prisma.luoguUser.upsert({
    where: { uid },
    create: userInput,
    update: userInput,
  });
}

export const getLuoguUserName = (uid: number) =>
  updateLuoguUserSummary(uid).then((user) => user?.name ?? null);
