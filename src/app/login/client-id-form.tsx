"use client";

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

export default function ClientIdForm({
  action,
  ...props
}: Omit<React.ComponentProps<"form">, "action"> & {
  action: (formData: FormSchema) => Promise<void>;
}) {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      uid: "" as never,
      clientId: "",
    },
  });

  return (
    <Form {...form}>
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <form {...props} onSubmit={form.handleSubmit(action)}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold">欢迎回来</h1>
            <p className="text-balance text-muted-foreground">
              授权登录您的洛谷账号
            </p>
          </div>
          <FormField
            control={form.control}
            name="uid"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>用户 ID</FormLabel>
                <FormControl>
                  <Input
                    autoFocus
                    className="font-mono"
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
                    className="font-mono"
                    placeholder="__client_id"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            登录
          </Button>
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
