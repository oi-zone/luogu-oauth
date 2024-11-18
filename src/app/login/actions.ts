"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { SearchParams } from "next/dist/server/request/search-params";
import prisma from "@/lib/prisma";
import { formSchema, type FormSchema } from "./schemas";

export async function loginWithClientId(
  searchParams: SearchParams,
  formData: FormSchema,
) {
  const { uid, clientId } = await formSchema.parseAsync(formData);

  // TODO: validate _uid and __client_id
  await prisma.user.upsert({
    where: { id: uid },
    create: { id: uid, clientId },
    update: { clientId },
  });

  const urlSearchParams = new URLSearchParams(searchParams as never);
  urlSearchParams.set("uid", uid);
  const cookieStore = await cookies();
  cookieStore.set(uid, clientId);
  redirect(`/authorize?${urlSearchParams}`);
}
