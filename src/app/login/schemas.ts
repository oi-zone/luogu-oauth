import { z } from "zod";

export const formSchema = z.object({
  uid: z.coerce.number().int().min(1),
  clientId: z
    .string()
    .length(40)
    .regex(/^[0-9a-f]+$/),
});

export type FormSchema = z.infer<typeof formSchema>;
