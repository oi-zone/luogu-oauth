import type { SearchParams } from "next/dist/server/request/search-params";
import { loginWithClientId } from "./actions";
import ClientIdForm from "./client-id-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Page(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">登录</CardTitle>
        <CardDescription>
          请输入您的 Client ID 以授权登录您的洛谷账号
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ClientIdForm action={loginWithClientId.bind(null, searchParams)} />
      </CardContent>
    </Card>
  );
}
