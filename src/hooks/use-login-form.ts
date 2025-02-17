"use client";

import { startTransition, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { type FieldValues, useForm } from "react-hook-form";

export type LoginFormState = { message: string } | undefined;

export default function useLoginForm<
  TFieldValues extends FieldValues = FieldValues,
>(
  props: Parameters<typeof useForm<TFieldValues>>[0],
  action: (
    query: string,
    state: LoginFormState,
    payload: TFieldValues,
  ) => Promise<LoginFormState>,
) {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") ?? "";

  const form = useForm(props);
  const [state, formAction, pending] = useActionState(
    action.bind(null, query),
    undefined,
  );
  const submitAction: Parameters<typeof form.handleSubmit>[0] = (payload) => {
    startTransition(() => {
      formAction(payload);
    });
  };
  return [form, state, form.handleSubmit(submitAction), pending] as const;
}
