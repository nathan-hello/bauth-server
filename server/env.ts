function loadEnv<const K extends string>(...keys: K[]): Record<K, string> {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(`MISSING_API_KEYS: ${JSON.stringify(missing)}`);
  }
  return process.env as Record<K, string>;
}

export const dotenv = loadEnv(
  "BETTER_AUTH_SECRET",
  "COOKIE_PREFIX",
  "DB_FILE_NAME",
  "FROM_EMAIL",
  "LOG_FILE_PATH",
  "OTEL_LOGS_URL",
  "OTEL_TRACES_URL",
  "PRODUCTION_URL",
  "RESEND_ACCESS_TOKEN",
);
