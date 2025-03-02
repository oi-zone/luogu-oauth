import { BadgeCheck } from "lucide-react";

import { updateLuoguUserSummary } from "@/lib/luogu";
import { cn } from "@/lib/utils";
import bg from "@/styles/luogu-color-bg.module.css";
import text from "@/styles/luogu-color-text.module.css";

export default async function UserInfoText({ uid }: { uid: number }) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = (await updateLuoguUserSummary(uid))!;
  return (
    <span>
      <span className={text[user.color.toLowerCase()]}>{user.name}</span>
      {user.badge && (
        <span
          className={cn(
            bg[user.color.toLowerCase()],
            `relative ms-1 rounded-md px-1 py-0.5 font-semibold text-white`,
          )}
          style={{ top: "-0.0875rem", fontSize: "0.72rem" }}
        >
          {user.badge}
        </span>
      )}
      {user.ccfLevel >= 3 && (
        <BadgeCheck
          className={cn(
            user.ccfLevel >= 6
              ? user.ccfLevel >= 8
                ? text.gold
                : text.blue
              : text.green,
            "relative ms-1 inline-block",
          )}
          strokeWidth={3}
          style={{ top: "-0.11rem" }}
        />
      )}
    </span>
  );
}
