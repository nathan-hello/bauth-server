import { dotenv } from "./env";
import { StartLogging } from "./telemetry/sdk";
import { MultiLogExporter, FileLogExporter } from "./telemetry/exporters";

StartLogging({
  tracesUrl: dotenv.OTEL_TRACES_URL,
  exporters: new MultiLogExporter([
    new FileLogExporter(dotenv.LOG_FILE_PATH),
  ]),
});
