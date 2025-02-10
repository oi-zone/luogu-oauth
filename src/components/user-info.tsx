import { Suspense } from "react";
import { getImageProps } from "next/image";
import { getLuoguUserAvatar, getLuoguUserName } from "@/lib/luogu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserInfo({ uid }: { uid: number }) {
  return (
    <div className="flex items-center space-x-4">
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
      <Suspense fallback={<Skeleton className="h-4 w-24" />}>
        <span>{getLuoguUserName(uid)}</span>
      </Suspense>
    </div>
  );
}
