import { z } from "zod";

export const formSchema = z.object({
  uid: z.coerce.number(),
  clientId: z.string().regex(/^[0-9a-f]{40}$/),
});

export type FormSchema = z.infer<typeof formSchema>;
