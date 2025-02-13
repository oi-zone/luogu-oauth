import { updateLuoguUserSummary } from "@/lib/luogu";
import { BadgeCheck } from "lucide-react";

export default async function UserInfoText({ uid }: { uid: number }) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = (await updateLuoguUserSummary(uid))!;
  return (
    <span>
      <span className={`text-luogu-${user.color.toLowerCase()}`}>
        {user.name}
      </span>
      {user.badge && (
        <span
          className={`bg-luogu-${user.color.toLowerCase()} relative ms-1 rounded-md px-1 py-0.5 font-semibold text-white`}
          style={{ top: "-0.0875rem", fontSize: "0.72rem" }}
        >
          {user.badge}
        </span>
      )}
      {user.ccfLevel >= 3 && (
        <BadgeCheck
          className={`inline-block ${
            user.ccfLevel >= 6
              ? user.ccfLevel >= 8
                ? "text-luogu-gold"
                : "text-luogu-blue"
              : "text-luogu-green"
          } relative ms-1`}
          strokeWidth={3}
          style={{ top: "-0.11rem" }}
        />
      )}
    </span>
  );
}
