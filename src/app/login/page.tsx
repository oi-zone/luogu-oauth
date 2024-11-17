import type { SearchParams } from "next/dist/server/request/search-params";
import { redirect } from "next/navigation";
import Form from "next/form";

export default async function Page(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;

  // eslint-disable-next-line @typescript-eslint/require-await
  async function login(formData: FormData) {
    "use server";

    const urlSearchParams = new URLSearchParams(searchParams as never);
    urlSearchParams.set("uid", formData.get("uid") as string);
    // TODO
    redirect(`/authorize?${urlSearchParams}`);
  }

  return (
    <Form action={login}>
      <input type="number" name="uid" />
      <input type="submit" />
    </Form>
  );
}
