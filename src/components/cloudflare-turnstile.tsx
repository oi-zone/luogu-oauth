import { Turnstile, type TurnstileProps } from "@marsidev/react-turnstile";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import styles from "@/styles/turnstile.module.css";

export function CloudflareTurnstile(props: Partial<TurnstileProps>) {
  return (
    <Turnstile
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY!}
      options={{ size: "flexible" }}
      className={cn(
        styles.turnstile,
        "overflow-hidden rounded-md border shadow-xs",
      )}
      {...props}
    >
      <Skeleton className="size-full rounded-none" />
    </Turnstile>
  );
}
