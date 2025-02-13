import type {
  SelfDetails,
  UserDetails,
  UserSummary,
} from "luogu-api-docs/luogu-api";
import type { Prisma } from "@prisma/client";
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

export async function saveClientId(
  uid: number,
  clientId: string,
): Promise<boolean> {
  const res = await fetch(
    "https://www.luogu.com.cn/api/user/currentUserInfoOAuth2",
    { headers: { Cookie: `_uid=${uid.toString()}; __client_id=${clientId}` } },
  );
  if (
    res.status !== 200 ||
    !res.headers.get("content-type")?.startsWith("application/json")
  )
    return false;
  const user = (await res.json()) as UserDetails & SelfDetails;
  if (user.uid !== uid) return false;

  const userInput: Prisma.LuoguUserCreateInput = {
    uid,
    name: user.name,
    avatar: user.avatar,
    slogan: user.slogan,
    badge: user.badge,
    isAdmin: user.isAdmin,
    isBanned: user.isBanned,
    color: user.color,
    ccfLevel: user.ccfLevel,
    background: user.background,
    isRoot: user.isRoot ?? false,
    sessions: {
      connectOrCreate: { where: { clientId }, create: { clientId } },
    },
  };
  await prisma.luoguUser.upsert({
    where: { uid },
    create: userInput,
    update: userInput,
  });
  return true;
}
