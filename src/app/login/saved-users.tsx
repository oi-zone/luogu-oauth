import { getIronSessionData } from "@/lib/session";
import UserInfo from "@/components/user-info";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export default async function SavedUsers({
  action,
}: {
  action: (uid: number) => Promise<void>;
}) {
  const session = await getIronSessionData();

  return (
    <Command>
      <CommandInput autoFocus placeholder="Type a command or search..." />
      <CommandList>
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
