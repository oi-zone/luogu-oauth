import { getIronSessionData } from "@/lib/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UserInfo from "@/components/user-info";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { login } from "./actions";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getIronSessionData();
  const { next } = await searchParams;

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">选择账号</CardTitle>
        <CardDescription>请选择希望用于授权登录的洛谷账号</CardDescription>
      </CardHeader>
      <CardContent>
        <Command>
          <CommandInput autoFocus placeholder="Type a command or search..." />
          <CommandList>
            {Array.from(new Set(session.saved)).map((uid) => (
              <CommandItem
                key={uid}
                keywords={[uid.toString()]}
                onSelect={login.bind(null, uid, next as string)} // eslint-disable-line @typescript-eslint/no-misused-promises
                asChild
              >
                <UserInfo uid={uid} />
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </CardContent>
    </Card>
  );
}
