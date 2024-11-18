import type { SearchParams } from "next/dist/server/request/search-params";
import { loginWithClientId } from "./actions";
import ClientIdForm from "./client-id-form";

export default async function Page(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  return <ClientIdForm action={loginWithClientId.bind(null, searchParams)} />;
}
