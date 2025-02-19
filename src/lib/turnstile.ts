// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY!;

interface SuccessfulValidationResponse {
  success: boolean;
  challenge_ts: string;
  hostname: string;
  "error-codes": [];
  action: string;
  cdata: string;
  metadata: unknown;
}

interface FailedValidationResponse {
  success: false;
  "error-codes": string[];
}

export async function siteVerify(
  response: string,
  remoteip?: string,
  idempotencyKey?: string,
) {
  const formData = new FormData();
  formData.append("secret", TURNSTILE_SECRET_KEY);
  formData.append("response", response);
  if (remoteip) formData.append("remoteip", remoteip);
  if (idempotencyKey) formData.append("idempotency_key", idempotencyKey);

  const result = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { body: formData, method: "POST" },
  );
  return (await result.json()) as
    | SuccessfulValidationResponse
    | FailedValidationResponse;
}
