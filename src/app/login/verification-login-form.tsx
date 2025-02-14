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

export default function VerificationLoginForm() {
  const [token, setToken] = useState("");
  const [code, setCode] = useState<{
    txt: string;
    iat: number;
    exp: number;
  } | null>(null);
  useEffect(() => {
    if (token) setCode(jwt.decode(token) as typeof code);
  }, [token]);

  const [progress, setProgress] = useState(100);
  useEffect(() => {
    if (code) setProgress(0);
  }, [code]);
  useEffect(() => {
    if (progress < 100 && code) {
      const timeout = setTimeout(() => {
        setProgress(
          Math.min(
            (new Date().getTime() / 1000 - code.iat) / (code.exp - code.iat),
            1,
          ) * 100,
        );
      }, 1000);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [code, progress]);

  const searchParams = useSearchParams();
  const query = searchParams.get("query") ?? "";
  const [state, formAction, pending] = useActionState(
    loginWithVerification.bind(null, query, token),
    undefined,
  );

  const form = useForm<z.infer<typeof verificationLoginFormSchema>>({
    resolver: zodResolver(verificationLoginFormSchema),
    defaultValues: {
      uid: "" as never,
    },
  });

  const submitAction: Parameters<typeof form.handleSubmit>[0] = (payload) => {
    startTransition(() => {
      formAction(payload);
    });
  };

  const expired = !code || progress === 100;

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6"
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={form.handleSubmit(submitAction)}
      >
        <div className="flex w-full gap-2">
          <div className="relative flex-grow">
            <Input
              className="relative z-10"
              type="text"
              value={code?.txt ?? ""}
              readOnly
              disabled={expired}
            />
            <Progress.Root
              className="absolute left-0 top-0 h-full w-full overflow-hidden rounded-md"
              value={progress}
            >
              <Progress.Indicator
                className="h-full bg-input transition-all"
                style={{ width: `${progress.toString()}%` }}
              />
            </Progress.Root>
          </div>
          <div className="relative inline-flex">
            <Button
              type="button"
              variant="secondary"
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onClick={() => generateToken().then(setToken)}
            >
              获取验证码
            </Button>
            {expired && (
              <span className="absolute right-0 top-0 -mr-1 -mt-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500"></span>
              </span>
            )}
          </div>
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
        <Button type="submit" className="w-full" disabled={pending || expired}>
          检查
        </Button>
      </form>
    </Form>
  );
}
