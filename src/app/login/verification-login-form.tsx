"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Noto_Serif_TC } from "next/font/google";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Progress from "@radix-ui/react-progress";
import jwt from "jsonwebtoken";
import { AlertCircle, ClipboardCopy, RotateCw } from "lucide-react";

import { cn } from "@/lib/utils";
import useLoginForm from "@/hooks/use-login-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CloudflareTurnstile } from "@/components/cloudflare-turnstile";

import { generateToken, loginWithVerification } from "./actions";
import { verificationLoginFormSchema } from "./schemas";

const notoSerif = Noto_Serif_TC({ subsets: [] });

interface Code {
  txt: string;
  refresh: number;
  iat: number;
  exp: number;
}

const formatTime = (seconds: number): string =>
  `${Math.floor(seconds / 60).toString()}:${(seconds % 60).toString().padStart(2, "0")}`;

export default function VerificationLoginForm() {
  const [tokens, setTokens] = useState<string[]>([]);
  const [code, setCode] = useState<Code | null>(null);
  const [generating, startGeneration] = useTransition();
  const [remainingTime, setRemainingTime] = useState(0);

  const newToken = () => {
    startGeneration(async () => {
      const reqTime = new Date().getTime() / 1000;
      const token = await generateToken();
      setTokens((prev) => [...prev, token]);
      const { iat, exp, ...code } = jwt.decode(token) as Code;
      setCode({ ...code, iat: reqTime, exp: reqTime - iat + exp });
      setRemainingTime(reqTime - iat + exp);
    });
  };

  const [progress, setProgress] = useState(100);
  useEffect(() => {
    if (code) {
      const updateProgress = () => {
        const now = new Date().getTime() / 1000;
        const percentage = ((now - code.iat) / code.refresh) * 100;
        setProgress(Math.min(percentage, 100));
        setRemainingTime(Math.max(code.exp - now, 0));
        if (now >= code.exp) clearInterval(timeout);
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

  // 复制验证码文本
  const [copying, startCopy] = useTransition();
  const codeInputRef = useRef<HTMLInputElement>(null);

  const [form, state, formAction, pending, turnstileProps] = useLoginForm(
    {
      resolver: zodResolver(verificationLoginFormSchema),
      defaultValues: { uid: "" as never },
    },
    loginWithVerification.bind(null, tokens),
  );

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-6"
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={formAction}
      >
        <FormItem>
          <FormLabel>验证码</FormLabel>
          <div className="flex w-full gap-2">
            <div className="relative flex-grow">
              <FormControl>
                <Input
                  ref={codeInputRef}
                  className={cn("relative z-10 pe-17", notoSerif.className)}
                  type="text"
                  value={code?.txt ?? ""}
                  readOnly
                  disabled={!code}
                />
              </FormControl>
              <Progress.Root
                className="absolute bottom-0 left-0 h-9 w-full overflow-hidden rounded-md"
                value={progress}
              >
                <Progress.Indicator
                  className="bg-input h-full transition-all"
                  style={{ width: `${progress.toString()}%` }}
                />
              </Progress.Root>
              <div className="absolute right-0 bottom-0 z-10">
                <span
                  className="relative font-mono text-sm text-gray-400 select-none"
                  style={{ bottom: ".17rem" }}
                >
                  {formatTime(Math.ceil(remainingTime))}
                </span>
                <Button
                  className="cursor-pointer text-gray-400 hover:text-gray-500"
                  type="button"
                  variant="link"
                  size="icon"
                  onClick={() => {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const input = codeInputRef.current!;
                    input.select();
                    startCopy(() => navigator.clipboard.writeText(input.value));
                  }}
                  disabled={copying}
                  aria-label="复制"
                >
                  <ClipboardCopy aria-disabled />
                </Button>
              </div>
            </div>
            <Button
              className="cursor-pointer"
              type="button"
              variant="outline"
              size="icon"
              onClick={newToken}
              disabled={generating}
              aria-label="刷新"
            >
              <RotateCw aria-disabled />
            </Button>
          </div>
          <FormDescription>请将验证码文字粘贴至洛谷个人介绍。</FormDescription>
        </FormItem>
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
        <CloudflareTurnstile {...turnstileProps} />
        {state && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>出错啦！</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
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
