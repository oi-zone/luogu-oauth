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
import ButtonTabSelect from "./button-tab-select";

export default function ClientIdForm({
  action,
  showSelectButton,
  ...props
}: Omit<React.ComponentProps<"form">, "action"> & {
  action: (formData: FormSchema) => Promise<void>;
  showSelectButton: boolean;
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
          <FormField
            control={form.control}
            name="uid"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>用户 ID</FormLabel>
                <FormControl>
                  <Input
                    autoFocus
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
          <Button type="submit" className="w-full">
            登录
          </Button>
          {showSelectButton && <ButtonTabSelect />}
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
