import type { UserSummary } from "luogu-api-docs/luogu-api";

export const getLuoguUserAvatar = (uid: number) =>
  `https://cdn.luogu.com.cn/upload/usericon/${uid.toString()}.png`;

export async function getLuoguUserName(uid: number) {
  const url = new URL("https://www.luogu.com.cn/api/user/search");
  url.searchParams.set("keyword", uid.toString());
  const response = await fetch(url, {
    headers: { "x-luogu-type": "content-only" },
    next: { revalidate: 3600 },
  });
  const { users } = (await response.json()) as { users: [UserSummary | null] };
  return users[0]?.name ?? null;
}
