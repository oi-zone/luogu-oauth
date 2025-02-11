import type { SearchParams } from "next/dist/server/request/search-params";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { loginWithClientId } from "./actions";
import ClientIdForm from "./client-id-form";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { query } = await searchParams;

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">登录</CardTitle>
        <CardDescription>
          请输入您的 Client ID 以授权登录您的洛谷账号
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ClientIdForm action={loginWithClientId.bind(null, query as string)} />
      </CardContent>
    </Card>
  );
}
