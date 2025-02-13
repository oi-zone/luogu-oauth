import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import UserInfo from "@/components/user-info";
import ButtonTabLogin from "./button-tab-login";

export default function SavedUsers({
  users,
  action,
}: {
  users: number[];
  action: (uid: number) => Promise<void>;
}) {
  return (
    <Command>
      <CommandInput placeholder="搜索保存的用户..." />
      <CommandList>
        <CommandEmpty>没有找到已保存的用户。</CommandEmpty>
        {users.map((uid) => (
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
      <div className="mt-6">
        <ButtonTabLogin />
      </div>
    </Command>
  );
}
