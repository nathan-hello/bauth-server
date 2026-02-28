import { ExportResultCode, type ExportResult } from "@opentelemetry/core";
import type { LogRecordExporter, ReadableLogRecord } from "@opentelemetry/sdk-logs";
import { openSync, writeSync, closeSync } from "node:fs";
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

export class FileLogExporter implements LogRecordExporter {
  private fd: number;
  constructor(file: string) {
    console.log("opening file");
    this.fd = openSync(file, "a");
    console.log("opened file", this.fd);
  }

  export(logRecords: ReadableLogRecord[], resultCallback: (result: ExportResult) => void) {
    console.log("got record", logRecords.length, JSON.stringify(logRecords));
    for (const record of logRecords) {
      const spanContext = record.spanContext;
      const entry = JSON.stringify({
        level: this.mapSeverity(record.severityNumber),
        time:
          record.hrTime ?
            new Date(Number(record.hrTime[0]) * 1000).toISOString()
          : new Date().toISOString(),
        name: "bauth-server",
        msg: typeof record.body === "string" ? record.body : JSON.stringify(record.body),
        ...record.attributes,
        ...(spanContext && {
          trace_id: spanContext.traceId,
          span_id: spanContext.spanId,
        }),
      });
      console.log("writing log record");
      writeSync(this.fd, entry + "\n");
    }

    console.log("calling back");
    resultCallback({ code: ExportResultCode.SUCCESS });
  }

  private mapSeverity(severity?: number): string {
    if (!severity) return "info";
    if (severity <= 8) return "debug";
    if (severity <= 12) return "info";
    if (severity <= 16) return "warn";
    return "error";
  }

  shutdown() {
    closeSync(this.fd);
    return Promise.resolve();
  }
}
