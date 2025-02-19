import { Suspense } from "react";
import { getImageProps } from "next/image";

import { getLuoguUserAvatar } from "@/lib/luogu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

import UserInfoText from "./user-info-text";

export default function UserInfo({ uid }: { uid: number }) {
  return (
    <div className="flex items-center space-x-1.5">
      <Avatar>
        <AvatarImage
          {...getImageProps({
            src: getLuoguUserAvatar(uid),
            alt: uid.toString(),
            width: 100,
            height: 100,
          }).props}
        />
        <AvatarFallback>
          <Skeleton className="h-full w-full" />
        </AvatarFallback>
      </Avatar>
      <div>
        <Suspense fallback={<Skeleton className="h-4 w-24" />}>
          <UserInfoText uid={uid} />
        </Suspense>
        <div className="text-xs text-gray-500">#{uid}</div>
      </div>
    </div>
  );
}
