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
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ClientIdForm from "./client-id-form";
import { loginWithClientId, select } from "./actions";
import SavedUsers from "./saved-users";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { query } = await searchParams;
  const session = await getIronSessionData();
  const saved = Array.from(new Set(session.saved));

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div
        className={cn("w-full max-w-sm", saved.length > 0 && "md:max-w-3xl")}
      >
        <div className="flex flex-col gap-6">
          <Carousel opts={{ watchDrag: false }}>
            <Card>
              <CardHeader className="md:m-4">
                <CardTitle className="text-2xl">欢迎回来</CardTitle>
                <CardDescription>授权登录您的洛谷账号</CardDescription>
              </CardHeader>
              <CardContent className="p-0 pl-4">
                <CarouselContent>
                  {saved.length > 0 && (
                    <CarouselItem className="pl-0 md:basis-1/2">
                      <SavedUsers
                        className="p-6 md:p-8 md:pt-0"
                        users={saved}
                        action={select.bind(null, query as string)}
                      />
                    </CarouselItem>
                  )}
                  <CarouselItem className="pl-0 md:basis-1/2">
                    <ClientIdForm
                      className="p-6 md:p-8 md:pt-0"
                      action={loginWithClientId.bind(null, query as string)}
                    />
                  </CarouselItem>
                </CarouselContent>
              </CardContent>
            </Card>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
            By clicking continue, you agree to our{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
}
