import { createHonoServer } from "react-router-hono-server/node";
import { StartLogging } from "./telemetry/sdk";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-proto";
import { MultiLogExporter, PinoLogExporter } from "./telemetry/exporters";

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
);

StartLogging(
  new MultiLogExporter([
    new OTLPLogExporter({ url: "http://localhost:4318/v1/logs" }),
    new PinoLogExporter("./logs/otel.log"),
  ]),
);

const server = await createHonoServer();

export default server;
