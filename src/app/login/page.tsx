import type { SearchParams } from "next/dist/server/request/search-params";
import { LoginFormLayout } from "./login-form-layout";
import ClientIdForm from "@/app/login/client-id-form";
import { loginWithClientId, select } from "@/app/login/actions";
import SavedUsers from "@/app/login/saved-users";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { query } = await searchParams;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginFormLayout>
          <ClientIdForm
            className="p-6 md:p-8"
            action={loginWithClientId.bind(null, query as string)}
          />
          <div className="p-6 md:p-8">
            <SavedUsers action={select.bind(null, query as string)} />
          </div>
        </LoginFormLayout>
      </div>
    </div>
  );
}
