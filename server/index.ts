import { createHonoServer } from "react-router-hono-server/node";
import { dotenv } from "./env";
import { StartLogging } from "./telemetry/sdk";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-proto";
import { MultiLogExporter, PinoLogExporter } from "./telemetry/exporters";

StartLogging({
  tracesUrl: dotenv.OTEL_TRACES_URL,
  exporters: new MultiLogExporter([
    new OTLPLogExporter({ url: dotenv.OTEL_LOGS_URL }),
    new PinoLogExporter(dotenv.LOG_FILE_PATH),
  ]),
});

const server = await createHonoServer();

export default server;
