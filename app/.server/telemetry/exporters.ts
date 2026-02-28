import { ExportResultCode, type ExportResult } from "@opentelemetry/core";
import type { LogRecordExporter, ReadableLogRecord } from "@opentelemetry/sdk-logs";
import pino from "pino";
import type { AnyValue } from "@opentelemetry/api-logs";

export class MultiLogExporter implements LogRecordExporter {
  constructor(private exporters: (LogRecordExporter | null)[]) {}

  export(logRecords: ReadableLogRecord[], resultCallback: (result: ExportResult) => void) {
    for (const exporter of this.exporters) {
      exporter?.export(logRecords, () => {});
    }
    resultCallback({ code: ExportResultCode.SUCCESS });
  }

  async shutdown() {
    await Promise.all(this.exporters.map((e) => e?.shutdown()));
  }
}

export type LogEntry = {
  time: string;
  context: {
    spanId: string | undefined;
    traceId: string | undefined;
    traceName: string;
  };
  severity: {
    id: number;
    text: string;
  };
  name: string;
  data: AnyValue;
};

function toLogEntry(record: ReadableLogRecord): LogEntry {
  let body: string;
  if (typeof record.body === "string") {
    body = record.body;
  } else {
    try {
      body = JSON.stringify(record.body);
    } catch {
      body = "OTEL_ENTRY_BODY_WAS_NOT_STRING_AND_JSON_STRINGIFY_FAILED";
    }
  }
  return {
    time:
      record.hrTime ?
        new Date(Number(record.hrTime[0]) * 1000).toISOString()
      : new Date().toISOString().slice(11, 23),
    context: {
      spanId: record.spanContext?.spanId,
      traceId: record.spanContext?.traceId,
      traceName: record.instrumentationScope.name,
    },
    severity: {
      id: record.severityNumber?.valueOf() ?? -1,
      text: record.severityText ?? "unknown-severity",
    },
    name: body,
    data: record.attributes,
  };
}

export class CustomExporter implements LogRecordExporter {
  constructor(private callback: (log: ReadableLogRecord) => void) {}

  export(logRecords: ReadableLogRecord[], resultCallback: (result: ExportResult) => void) {
    for (const record of logRecords) {
      this.callback(record);
    }
    resultCallback({ code: ExportResultCode.SUCCESS });
  }

  async shutdown() {}
}

export class PinoLogExporter implements LogRecordExporter {
  private pinoLogger: ReturnType<typeof pino>;
  constructor(file: string) {
    const level = process.env.NODE_ENV === "development" ? "trace" : "warn";
    this.pinoLogger = pino(
      {
        enabled: true,
        level,
      },
      pino.destination({ dest: file, sync: true }),
    );
  }

  export(logRecords: ReadableLogRecord[], resultCallback: (result: ExportResult) => void) {
    for (const record of logRecords) {
      const level = this.mapSeverity(record.severityNumber);
      const spanContext = record.spanContext;

      const attrs = this.sanitize(record.attributes, ["scope", "trace_id", "span_id"]);

      this.pinoLogger[level](
        {
          scope: record.instrumentationScope.name,
          ...attrs,
          ...(spanContext && {
            trace_id: spanContext.traceId,
            span_id: spanContext.spanId,
          }),
        },
        typeof record.body === "string" ? record.body : JSON.stringify(record.body),
      );
    }
    resultCallback({ code: ExportResultCode.SUCCESS });
  }

  private mapSeverity(severity?: number): pino.Level {
    if (!severity) return "info";
    if (severity <= 8) return "debug";
    if (severity <= 12) return "info";
    if (severity <= 16) return "warn";
    return "error";
  }

  private sanitize<T extends Record<string,any>>(attrs: T, keys: string[]): T {
    keys.forEach(k => {
      if (k in attrs) {
        console.error(`[ERROR]: ${k} is not allowed in otel logs: ${JSON.stringify(attrs)}`)
        delete attrs[k]
      }
    })

    return attrs
  }


  shutdown() {
    return Promise.resolve();
  }
}
