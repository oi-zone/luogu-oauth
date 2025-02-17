"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import jwt from "jsonwebtoken";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import * as Progress from "@radix-ui/react-progress";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { verificationLoginFormSchema } from "./schemas";
import { generateToken, loginWithVerification } from "./actions";
import { ClipboardCopy, RotateCw } from "lucide-react";

export default function VerificationLoginForm() {
  const [token, setToken] = useState("");
  const newToken = () => generateToken().then(setToken);

  const [code, setCode] = useState<{
    txt: string;
    iat: number;
    exp: number;
  } | null>(null);
  useEffect(() => {
    if (token) setCode(jwt.decode(token) as typeof code);
  }, [token]);

  const [progress, setProgress] = useState(100);
  const expired = progress === 100;
  useEffect(() => {
    if (code) {
      const updateProgress = () => {
        const percentage =
          ((new Date().getTime() / 1000 - code.iat) / (code.exp - code.iat)) *
          100;
        setProgress(Math.min(percentage, 100));
        if (percentage >= 100) clearInterval(timeout);
      };
      const timeout = setInterval(updateProgress, 1000);
      updateProgress();
      return () => {
        clearInterval(timeout);
      };
    }
  }, [code]);

  // 自动刷新验证码
  useEffect(() => {
    if (progress === 100) startTransition(newToken);
  }, [progress]);

  const searchParams = useSearchParams();
  const query = searchParams.get("query") ?? "";
  const [state, formAction, pending] = useActionState(
    loginWithVerification.bind(null, query, token),
    undefined,
  );

  const form = useForm<z.infer<typeof verificationLoginFormSchema>>({
    resolver: zodResolver(verificationLoginFormSchema),
    defaultValues: { uid: "" as never },
  });

  const submitAction: Parameters<typeof form.handleSubmit>[0] = (payload) => {
    startTransition(() => {
      formAction(payload);
    });
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6"
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit(submitAction)}
      >
        <div className="flex w-full items-end gap-2">
          <div className="relative flex-grow">
            <FormItem>
              <FormLabel>验证码</FormLabel>
              <FormControl>
                <Input
                  className="relative z-10 pe-8 font-mono"
                  type="text"
                  value={code?.txt ?? ""}
                  readOnly
                  disabled={expired}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
            <Progress.Root
              className="absolute bottom-0 left-0 h-9 w-full overflow-hidden rounded-md"
              value={progress}
            >
              <Progress.Indicator
                className="bg-input h-full transition-all"
                style={{ width: `${progress.toString()}%` }}
              />
            </Progress.Root>
            <Button
              className="absolute right-0 bottom-0 z-10 cursor-pointer text-gray-400 hover:text-gray-500"
              type="button"
              variant="link"
              size="icon"
            >
              <ClipboardCopy />
            </Button>
          </div>
          <Button
            className="cursor-pointer"
            type="button"
            variant="outline"
            size="icon"
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onClick={newToken}
          >
            <RotateCw />
          </Button>
        </div>
        <FormField
          control={form.control}
          name="uid"
          render={({ field }) => (
            <FormItem>
              <FormLabel>用户 ID</FormLabel>
              <FormControl>
                <Input
                  autoComplete="off"
                  className="number-field-no-arrow"
                  type="number"
                  {...field}
                  min={1}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* TODO: style */}
        <FormMessage>{state?.message}</FormMessage>
        <Button
          type="submit"
          className="w-full cursor-pointer"
          disabled={pending}
        >
          检查
        </Button>
      </form>
    </Form>
  );
}
