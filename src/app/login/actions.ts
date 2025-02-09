"use server";

import { redirect } from "next/navigation";
import type { SearchParams } from "next/dist/server/request/search-params";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "@/lib/constants";
import { getIronSessionData } from "@/lib/session";
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

  const session = await getIronSessionData();
  session.saved.push(Number(uid));
  await session.save();

  const urlSearchParams = new URLSearchParams(searchParams as never);
  urlSearchParams.set(
    "uid",
    jwt.sign({ uid }, SECRET_KEY, { expiresIn: "30s" }),
  );

  redirect(`/authorize?${urlSearchParams}`);
}
