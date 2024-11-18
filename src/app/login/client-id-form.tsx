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
}: {
  action: (formData: FormSchema) => Promise<void>;
}) {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      uid: "",
      clientId: "",
    },
  });

  return (
    <Form {...form}>
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <form onSubmit={form.handleSubmit(action)}>
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="uid"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel>用户 ID</FormLabel>
                <FormControl>
                  <Input placeholder="_uid" type="number" {...field} min={1} />
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
                <FormLabel>Client ID</FormLabel>
                <FormControl>
                  <Input placeholder="__client_id" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            登录
          </Button>
        </div>
      </form>
    </Form>
  );
}
