import { readFileSync } from "node:fs";

function getEnv(name: string, defaultValue?: string): string | undefined {
  const filename = process.env[`${name}_FILE`];
  if (filename) return readFileSync(filename, "utf8").trim();
  return process.env[name] ?? defaultValue;
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const SECRET_KEY = getEnv("SECRET_KEY")!;

export const VERIFICATION_CODE_EXPIRES_IN = "90s";
export const VERIFICATION_CODE_REFRESH_INTERVAL = 45;
