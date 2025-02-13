"use client";

import { startTransition, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { formSchema, type FormSchema } from "./schemas";
import { loginWithClientId } from "./actions";

export default function ClientIdForm({ children }: React.PropsWithChildren) {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") ?? "";
  const [state, formAction, pending] = useActionState(
    loginWithClientId.bind(null, query),
    undefined,
  );

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      uid: "" as never,
      clientId: "",
    },
  });

  function submitAction(payload: FormSchema) {
    startTransition(() => {
      formAction(payload);
    });
  }

  return (
    <Form {...form}>
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <form onSubmit={form.handleSubmit(submitAction)}>
        <div className="flex flex-col gap-6">
          <FormField
            control={form.control}
            name="uid"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>用户 ID</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="off"
                    className="number-field-no-arrow font-mono"
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
                    className="font-mono"
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
          {children}
          <div className="text-center text-sm">
            没有账号？
            <a
              href="https://www.luogu.com.cn/auth/register"
              className="underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              注册
            </a>
          </div>
        </div>
      </form>
    </Form>
  );
}
