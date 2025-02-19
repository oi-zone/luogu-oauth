import type { SearchParams } from "next/dist/server/request/search-params";

import { getIronSessionData } from "@/lib/session";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { select } from "./actions";
import ButtonTabSelect from "./button-tab-select";
import ClientIdForm from "./client-id-form";
import SavedUsers from "./saved-users";
import VerificationLoginForm from "./verification-login-form";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { query } = await searchParams;
  const session = await getIronSessionData();
  const saved = Array.from(new Set(session.saved));
  const twoCols = saved.length > 0;

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className={cn("w-full max-w-sm", twoCols && "md:max-w-3xl")}>
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="!pb-0 md:p-8">
              <CardTitle className="text-2xl">欢迎回来</CardTitle>
              <CardDescription>授权登录您的洛谷账号</CardDescription>
            </CardHeader>
            <CardContent className="p-0 pl-4">
              <Carousel opts={{ watchDrag: false, duration: 14 }}>
                <CarouselContent>
                  {twoCols && (
                    <CarouselItem className="p-6 md:basis-1/2 md:p-8">
                      <SavedUsers
                        users={saved}
                        action={select.bind(null, query as string)}
                      />
                    </CarouselItem>
                  )}
                  <CarouselItem
                    className={cn(
                      "space-y-6 p-6 md:p-8",
                      twoCols && "md:basis-1/2",
                    )}
                  >
                    <Tabs defaultValue="client-id-form" className="w-full">
                      <TabsList className="mb-6 grid w-full grid-cols-2">
                        <TabsTrigger
                          className="cursor-pointer"
                          value="client-id-form"
                        >
                          Cookie 登录
                        </TabsTrigger>
                        <TabsTrigger
                          className="cursor-pointer"
                          value="verification-login-form"
                        >
                          验证码登录
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="client-id-form">
                        <ClientIdForm />
                      </TabsContent>
                      <TabsContent value="verification-login-form">
                        <VerificationLoginForm />
                      </TabsContent>
                    </Tabs>
                    {twoCols && <ButtonTabSelect />}
                    <div className="text-center text-sm">
                      没有账号？
                      <a
                        href="https://www.luogu.com.cn/auth/register"
                        className="underline underline-offset-4"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        注册
                      </a>
                    </div>
                  </CarouselItem>
                </CarouselContent>
              </Carousel>
            </CardContent>
          </Card>
          <div className="text-muted-foreground hover:[&_a]:text-primary text-center text-xs text-balance [&_a]:underline [&_a]:underline-offset-4">
            By clicking continue, you agree to our{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
