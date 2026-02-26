function loadEnv<const K extends string>(...keys: K[]): Record<K, string> {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(`MISSING_API_KEYS: ${JSON.stringify(missing)}`);
  }
  return process.env as Record<K, string>;
}

export const dotenv = loadEnv(
  "NODE_ENV",
  "DB_FILE_NAME",
  "PRODUCTION_URL",
  "BETTER_AUTH_SECRET",
  "RESEND_ACCESS_TOKEN",
  "POLAR_ACCESS_TOKEN",
  "POLAR_SUCCESS_URL",
  "COOKIE_PREFIX",
  "FROM_EMAIL",
  "OTEL_LOGS_URL",
  "OTEL_TRACES_URL",
  "LOG_FILE_PATH",
);
