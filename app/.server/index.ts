import { createHonoServer } from "react-router-hono-server/bun";
import { dotenv } from "./env";
import { StartLogging } from "./telemetry/sdk";
import { MultiLogExporter, PinoLogExporter } from "./telemetry/exporters";

StartLogging({
  tracesUrl: dotenv.OTEL_TRACES_URL,
  exporters: new MultiLogExporter([
    new PinoLogExporter(dotenv.LOG_FILE_PATH),
  ]),
});

await createHonoServer();
