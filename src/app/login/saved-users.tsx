import { getIronSessionData } from "@/lib/session";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import UserInfo from "@/components/user-info";

export default async function SavedUsers({
  action,
}: {
  action: (uid: number) => Promise<void>;
}) {
  const session = await getIronSessionData();

  return (
    <Command>
      <CommandInput placeholder="搜索保存的用户..." />
      <CommandList>
        <CommandEmpty>没有找到已保存的用户。</CommandEmpty>
        {Array.from(new Set(session.saved)).map((uid) => (
          <CommandItem
            key={uid}
            keywords={[uid.toString()]}
            onSelect={action.bind(null, uid)} // eslint-disable-line @typescript-eslint/no-misused-promises
            asChild
          >
            <UserInfo uid={uid} />
          </CommandItem>
        ))}
      </CommandList>
    </Command>
  );
}
