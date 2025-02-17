"use client";

import { useEffect, useState, useTransition } from "react";
import jwt from "jsonwebtoken";
import { zodResolver } from "@hookform/resolvers/zod";
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
import useLoginForm from "@/hooks/use-login-form";
import { verificationLoginFormSchema } from "./schemas";
import { generateToken, loginWithVerification } from "./actions";

interface Code {
  txt: string;
  iat: number;
  exp: number;
}

export default function VerificationLoginForm() {
  const [token, setToken] = useState("");
  const [code, setCode] = useState<Code | null>(null);
  const [generating, startGeneration] = useTransition();
  const newToken = () => {
    startGeneration(async () => {
      const reqTime = new Date().getTime() / 1000;
      const token = await generateToken();
      setToken(token);
      const { txt, iat, exp } = jwt.decode(token) as Code;
      setCode({ txt, iat: reqTime, exp: reqTime - iat + exp });
    });
  };

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
    if (progress === 100) newToken();
  }, [progress]);

  const [form, state, formAction, pending] = useLoginForm(
    {
      resolver: zodResolver(verificationLoginFormSchema),
      defaultValues: { uid: "" as never },
    },
    loginWithVerification.bind(null, token),
  );

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6"
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={formAction}
      >
        <div className="flex w-full gap-2">
          <div className="relative flex-grow">
            <Input
              className="relative z-10 font-mono"
              type="text"
              value={code?.txt ?? ""}
              readOnly
              disabled={expired}
            />
            <Progress.Root
              className="absolute top-0 left-0 h-full w-full overflow-hidden rounded-md"
              value={progress}
            >
              <Progress.Indicator
                className="bg-input h-full transition-all"
                style={{ width: `${progress.toString()}%` }}
              />
            </Progress.Root>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={newToken}
            disabled={generating}
          >
            获取验证码
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
        <Button type="submit" className="w-full" disabled={pending}>
          检查
        </Button>
      </form>
    </Form>
  );
}
