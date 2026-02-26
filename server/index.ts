import { createHonoServer } from "react-router-hono-server/node";
import { StartLogging } from "./telemetry/sdk";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-proto";
import { MultiLogExporter, PinoLogExporter } from "./telemetry/exporters";

StartLogging(
  new MultiLogExporter([
    new OTLPLogExporter({ url: "http://localhost:4318/v1/logs" }),
    new PinoLogExporter("./logs/otel.log"),
  ]),
);

const server = await createHonoServer();

export default server;
