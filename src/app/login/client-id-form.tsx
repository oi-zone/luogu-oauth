"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import useLoginForm from "@/hooks/use-login-form";
import { formSchema } from "./schemas";
import { loginWithClientId } from "./actions";

export default function ClientIdForm() {
  const [form, state, formAction, pending] = useLoginForm(
    {
      resolver: zodResolver(formSchema),
      defaultValues: { uid: "" as never, clientId: "" },
    },
    loginWithClientId,
  );

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6"
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={formAction}
      >
        <FormField
          control={form.control}
          name="uid"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <FormLabel>用户 ID</FormLabel>
              <FormControl>
                <Input
                  autoComplete="off"
                  className="number-field-no-arrow"
                  placeholder="_uid"
                  type="number"
                  {...field}
                  min={1}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <div className="flex items-center">
                <FormLabel>Client ID</FormLabel>
                <a
                  href="#"
                  className="ml-auto text-sm underline-offset-2 hover:underline"
                >
                  这是什么？
                </a>
              </div>
              <FormControl>
                <Input
                  autoComplete="off"
                  placeholder="__client_id"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* TODO: style */}
        <FormMessage>{state?.message}</FormMessage>
        <Button type="submit" className="w-full" disabled={pending}>
          登录
        </Button>
      </form>
    </Form>
  );
}
