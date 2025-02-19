import { z } from "zod";

export const uidSchema = z.coerce.number().int().min(1);

export const clientIdLoginFormSchema = z.object({
  uid: uidSchema,
  clientId: z
    .string()
    .length(40)
    .regex(/^[0-9a-f]+$/),
});

export const verificationLoginFormSchema = z.object({
  uid: uidSchema,
});
