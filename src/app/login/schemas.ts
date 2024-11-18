import { z } from "zod";

export const formSchema = z.object({
  uid: z.string().regex(/^[1-9]\d*$/),
  clientId: z.string().regex(/^[0-9a-f]{40}$/),
});

export type FormSchema = z.infer<typeof formSchema>;
