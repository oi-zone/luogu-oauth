"use client";

import { startTransition, useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { TurnstileProps } from "@marsidev/react-turnstile";
import {
  useForm,
  type FieldValues,
  type SubmitHandler,
  type UseFormProps,
} from "react-hook-form";

export type LoginFormState = { message: string } | undefined;

export default function useLoginForm<
  TFieldValues extends FieldValues = FieldValues,
>(
  props: UseFormProps<TFieldValues>,
  action: (
    query: string,
    payload: TFieldValues,
    turnstileResponse: string,
  ) => Promise<LoginFormState>,
) {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") ?? "";

  const [turnstileResponse, setTurnstileResponse] = useState("");

  const form = useForm(props);
  const [state, formAction, pending] = useActionState(
    async (state: LoginFormState, payload: TFieldValues) =>
      action(query, payload, turnstileResponse),
    undefined,
  );
  const submitAction: SubmitHandler<TFieldValues> = (payload) => {
    startTransition(() => {
      formAction(payload);
    });
  };
  return [
    form,
    state,
    form.handleSubmit(submitAction),
    pending || !turnstileResponse,
    {
      onSuccess: setTurnstileResponse,
      onExpire() {
        setTurnstileResponse("");
      },
    } as Partial<TurnstileProps>,
  ] as const;
}
