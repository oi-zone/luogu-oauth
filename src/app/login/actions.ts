"use server";

import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "@/lib/constants";
import { getIronSessionData } from "@/lib/session";
import prisma from "@/lib/prisma";
import { updateLuoguUserSummary } from "@/lib/luogu";
import { formSchema, type FormSchema } from "./schemas";

function redirectToAuthorize(query: string, uid: number) {
  const urlSearchParams = new URLSearchParams(query);
  urlSearchParams.set(
    "uid",
    jwt.sign({ uid }, SECRET_KEY, { expiresIn: "30s" }),
  );

  redirect(`/authorize?${urlSearchParams}`);
}

export async function loginWithClientId(query: string, formData: FormSchema) {
  const { uid, clientId } = await formSchema.parseAsync(formData);

  if (!(await updateLuoguUserSummary(uid))) throw new Error("User not found");
  // TODO: validate _uid and __client_id
  await prisma.luoguUser.update({
    where: { uid },
    data: {
      sessions: {
        connectOrCreate: { where: { clientId }, create: { clientId } },
      },
    },
  });

  const session = await getIronSessionData();
  session.saved = Array.from(new Set(session.saved).add(uid));
  await session.save();

  redirectToAuthorize(query, uid);
}

export async function select(query: string, uid: number) {
  const session = await getIronSessionData();
  if (!session.saved.includes(uid))
    throw new Error("User not found in saved list");

  redirectToAuthorize(query, uid);
}
