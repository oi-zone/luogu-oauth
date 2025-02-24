import type { Prisma } from "@prisma/client";
import type {
  EloRatingSummary,
  SelfDetails,
  UserDetails,
  UserPractice,
} from "luogu-api-docs/luogu-api";

import prisma from "@/lib/prisma";

export const getLuoguUserAvatar = (uid: number) =>
  `https://cdn.luogu.com.cn/upload/usericon/${uid.toString()}.png`;

async function upsertLuoguUserPractice(
  uid: number,
  user: UserPractice,
): Promise<boolean> {
  if (user.passedProblemCount !== null && user.submittedProblemCount !== null) {
    const practiceInput: Prisma.LuoguUserPracticeUncheckedCreateInput = {
      uid: uid,
      passedProblemCount: user.passedProblemCount,
      submittedProblemCount: user.submittedProblemCount,
    };
    await prisma.luoguUserPractice.upsert({
      where: { uid },
      create: practiceInput,
      update: practiceInput,
    });
    return true;
  }
  return false;
}

async function upsertLuoguUserElo(uid: number, elo: EloRatingSummary) {
  const contestInput: Prisma.LuoguContestCreateInput = {
    id: elo.contest.id,
    name: elo.contest.name,
    startTime: new Date(elo.contest.startTime * 1000),
    endTime: new Date(elo.contest.endTime * 1000),
  };
  await prisma.luoguContest.upsert({
    where: { id: elo.contest.id },
    create: contestInput,
    update: contestInput,
  });

  const eloInput: Prisma.LuoguUserEloUncheckedCreateInput = {
    uid,
    contestId: elo.contest.id,
    rating: elo.rating,
    time: new Date(elo.time * 1000),
    latest: elo.latest,
  };
  await prisma.luoguUserElo.upsert({
    where: { uid },
    create: eloInput,
    update: eloInput,
  });
}

async function upsertLuoguUserInfo(
  user: Omit<UserDetails, "rating"> & UserPractice,
) {
  const userInput: Prisma.LuoguUserCreateInput = {
    registerTime: new Date(user.registerTime * 1000),
    introduction: user.introduction,
    prize: user.prize,
    followingCount: user.followingCount,
    followerCount: user.followerCount,
    ranking: user.ranking,
    eloValue: user.eloValue,
    blogAddress: user.blogAddress,
    uid: user.uid,
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
  };
  const luoguUser = await prisma.luoguUser.upsert({
    where: { uid: user.uid },
    create: userInput,
    update: userInput,
  });
  await upsertLuoguUserPractice(user.uid, user);
  if (user.elo) await upsertLuoguUserElo(user.uid, user.elo);
  return luoguUser;
}

export async function updateLuoguUserSummary(uid: number, cache = 3600000) {
  const luoguUser = await prisma.luoguUser.findUnique({
    where: { uid, updatedAt: { gte: new Date(Date.now() - cache) } },
  });
  if (luoguUser) return luoguUser;
  const response = await fetch(
    `https://www.luogu.com.cn/api/user/info/${uid.toString()}`,
    { headers: { "x-luogu-type": "content-only" } },
  );
  const { user } = (await response.json()) as {
    user?: Omit<UserDetails, "rating"> & UserPractice;
  };
  if (!user) return null;
  return await upsertLuoguUserInfo(user);
}

export async function saveClientId(
  uid: number,
  clientId: string,
): Promise<boolean> {
  const res = await fetch(
    `https://www.luogu.com.cn/api/user/info/${uid.toString()}`,
    { headers: { Cookie: `_uid=${uid.toString()}; __client_id=${clientId}` } },
  );
  if (
    res.status !== 200 ||
    !res.headers.get("content-type")?.startsWith("application/json")
  )
    return false;
  const { user } = (await res.json()) as {
    user?: UserDetails & UserPractice & SelfDetails;
  };
  if (user === undefined) return false;
  await upsertLuoguUserInfo(user);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (user.verified === undefined) return false;
  await prisma.luoguSession.upsert({
    where: { uid, clientId },
    create: { uid, clientId },
    update: { lastUsedAt: new Date() },
  });
  return true;
}
