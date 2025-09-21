type Events<T> =
  | ["connecting", void]
  | ["connected", void]
  | ["error", Error | unknown]
  | ["disconnected", Error | undefined]
  | ["drain", void]
  | ["retryScheduled", { delay: number; retryCount: number }]
  | ["receive", ParsedData<T>]
  | ["end", void]
  | ["timeout", void]
  | ["transmit", { bytesWritten: number }]
  | ["connectionClosed", void];

type EventAccessors = {
  write(data: string | Buffer): Promise<boolean>;
  connect: () => void;
  disconnect: () => void;
  clearBuffer: () => void;
  state: ConnectionState;
  socket: Bun.Socket | undefined;
};

type EventName = Events<any>[0];

type EventPayload<T, K extends EventName> = Extract<Events<T>, [K, any]>[1];

type EventHandler<T, K extends EventName> = (
  access: EventAccessors,
  payload: EventPayload<T, K>,
) => void;

type EventHandlers<T> = {
  [K in EventName]?: EventHandler<T, K>;
};

export interface IoTcp<T> {
  name: string;
  hostname: string;
  port: number;
  delimiter: DataDelimiter<T>;
  on?: EventHandlers<T>;
}

// Helper function to create IoTcp with proper type inference
export function createIoTcp<T, N extends string>(
  config: IoTcp<T> & { name: N },
): IoTcp<T> & { name: N } {
  return config;
}

export type ParsedData<T = any> = {
  data: T;
  raw: Buffer;
  timestamp: Date;
  connectionId: string;
};

export type ConnectionState = {
  isConnected: boolean;
  isConnecting: boolean;
  retryCount: number;
  lastError?: Error | unknown;
  lastConnected?: Date;
  totalBytesReceived: number;
  totalBytesSent: number;
};

export type DataDelimiter<T = any> = (buffer: Buffer) => T | null;

type Names<T extends readonly IoTcp<any>[]> = T[number]["name"];

export class TCPFactory<T extends readonly IoTcp<any>[]> {
  private connections = new Map<string, Bun.Socket>();
  private connectionStates = new Map<string, ConnectionState>();
  private retryTimeouts = new Map<string, NodeJS.Timeout>();
  private dataBuffers = new Map<string, Buffer>();
  private configs = new Map<string, IoTcp<any>>();
  private args: T;

  constructor(a: T) {
    this.args = a;

    this.args.forEach((config) => {
      const connectionId = config.name;
      this.configs.set(connectionId, config);

      this.connectionStates.set(connectionId, {
        isConnected: false,
        isConnecting: false,
        retryCount: 0,
        totalBytesReceived: 0,
        totalBytesSent: 0,
      });

      this.clearBuffer(connectionId);
    });
  }

  // Private emit method that calls the appropriate IoTcp.on handler
  private emit<T extends any, K extends EventName>(
    event: K,
    connectionId: string,
    payload: EventPayload<T, K>,
  ): void {
    const config = this.configs.get(connectionId);
    if (!config) return;

    console.log(
      `TCP: ${connectionId} ${event} ${payload.toString ? payload?.toString() : "No payload"}`,
    );

    if (!config.on) return;

    const handler = config.on[event];
    if (!handler) return;

    const write = (data: string | Buffer) => this.write(connectionId, data);
    const connect = () => this.connect(connectionId);
    const disconnect = () => this.disconnect(connectionId);
    const clearBuffer = () => this.clearBuffer(connectionId);
    const socket = this.connections.get(connectionId);

    const state = this.connectionStates.get(connectionId);
    if (!state) {
      return;
    }

    handler(
      { write, disconnect, state, socket, connect, clearBuffer },
      payload,
    );
  }

  private handleOpen(connectionId: string, _: Bun.Socket): void {
    const state = this.connectionStates.get(connectionId);
    if (!state) return;

    state.isConnected = true;
    state.isConnecting = false;
    state.retryCount = 0;
    state.lastConnected = new Date();
    state.lastError = undefined;

    // Clear any pending retry
    const retryTimeout = this.retryTimeouts.get(connectionId);
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      this.retryTimeouts.delete(connectionId);
    }

    this.emit("connected", connectionId, undefined);
  }

  private handleClose(
    connectionId: string,
    _: Bun.Socket,
    error?: Error,
  ): void {
    const state = this.connectionStates.get(connectionId);
    if (!state) return;

    state.isConnected = false;
    state.isConnecting = false;
    state.lastError = error;

    this.connections.delete(connectionId);
    this.emit("disconnected", connectionId, error);

    // Schedule retry if not manually closed
    if (error) {
      this.scheduleRetry(connectionId);
    }
  }

  private handleError(connectionId: string, _: Bun.Socket, error: Error): void {
    const state = this.connectionStates.get(connectionId);
    if (!state) return;

    state.lastError = error;
    this.emit("error", connectionId, error);
  }

  private handleConnectError(
    connectionId: string,
    _: Bun.Socket,
    error: Error,
  ): void {
    const state = this.connectionStates.get(connectionId);
    if (!state) return;

    state.isConnecting = false;
    state.lastError = error;
    this.emit("error", connectionId, error);
    this.scheduleRetry(connectionId);
  }

  private handleData(connectionId: string, _: Bun.Socket, data: Buffer): void {
    const state = this.connectionStates.get(connectionId);
    const config = this.configs.get(connectionId);

    if (!state || !config) return;

    state.totalBytesReceived += data.length;

    const currentBuffer = this.dataBuffers.get(connectionId) || Buffer.alloc(0);
    const newBuffer = Buffer.concat([currentBuffer, data]);

    const OneMegabyte = 1024 * 1024;

    if (newBuffer.length > OneMegabyte) {
      this.emit("error", connectionId, new Error("Buffer overflow"));
      this.disconnect(connectionId);
      return;
    }

    this.dataBuffers.set(connectionId, newBuffer);

    const parsed = config.delimiter(newBuffer);
    if (parsed !== null) {
      // Clear buffer after successful parse
      this.clearBuffer(connectionId);

      // We can't do type inference yet. In this function, it's always just going to be any
      const parsedData: ParsedData<any> = {
        data: parsed,
        raw: newBuffer,
        timestamp: new Date(),
        connectionId,
      };

      this.emit("receive", connectionId, parsedData);
    }
  }

  private handleDrain(connectionId: string, _: Bun.Socket): void {
    this.emit("drain", connectionId, undefined);
  }

  private handleEnd(connectionId: string, _: Bun.Socket): void {
    const state = this.connectionStates.get(connectionId);
    if (!state) return;

    state.isConnected = false;
    this.emit("end", connectionId, undefined);
  }

  private handleTimeout(connectionId: string, _: Bun.Socket): void {
    this.emit("timeout", connectionId, undefined);
    this.scheduleRetry(connectionId);
  }

  private async scheduleRetry(connectionId: string): Promise<void> {
    const config = this.configs.get(connectionId);
    const state = this.connectionStates.get(connectionId);

    if (!config || !state) return;

    state.retryCount++;

    const DELAY = 5000;

    this.emit("retryScheduled", connectionId, {
      delay: DELAY,
      retryCount: state.retryCount,
    });

    const timeout = setTimeout(async () => {
      this.retryTimeouts.delete(connectionId);
      await this.connect(connectionId);
    }, DELAY);

    this.retryTimeouts.set(connectionId, timeout);
  }

  async write(
    name: Names<T>,
    data: string | Uint8Array | Buffer,
  ): Promise<boolean> {
    const socket = this.connections.get(name);
    const state = this.connectionStates.get(name);

    if (!socket || !state?.isConnected) {
      return false;
    }

    try {
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
      const bytesWritten = socket.write(buffer);

      if (bytesWritten > 0) {
        state.totalBytesSent += bytesWritten;
        this.emit("transmit", name, { bytesWritten: bytesWritten });
        return true;
      }

      return false;
    } catch (error) {
      this.emit("error", name, error as Error);
      return false;
    }
  }

  async start() {
    Promise.all(
      this.args.map((a) => {
        return this.connect(a.name);
      }),
    );
  }

  async connect(connectionId: Names<T>): Promise<void> {
    const config = this.configs.get(connectionId);
    if (!config) {
      return;
    }
    const state = this.connectionStates.get(connectionId);

    if (!config || !state) {
      throw new Error(`Connection ${connectionId} not found`);
    }

    if (state.isConnecting || state.isConnected) {
      return;
    }

    state.isConnecting = true;
    state.lastError = undefined;

    try {
      const socket = await Bun.connect({
        hostname: config.hostname,
        port: config.port,
        socket: {
          open: (socket) => this.handleOpen(connectionId, socket),
          close: (socket, error) =>
            this.handleClose(connectionId, socket, error),
          error: (socket, error) =>
            this.handleError(connectionId, socket, error),
          connectError: (socket, error) =>
            this.handleConnectError(connectionId, socket, error),
          data: (socket, data) => this.handleData(connectionId, socket, data),
          drain: (socket) => this.handleDrain(connectionId, socket),
          end: (socket) => this.handleEnd(connectionId, socket),
          timeout: (socket) => this.handleTimeout(connectionId, socket),
        },
      });

      this.connections.set(connectionId, socket);
    } catch (error) {
      state.isConnecting = false;
      state.lastError = error;

      this.emit("error", connectionId, error);
      await this.scheduleRetry(connectionId);
    }
  }

  clearBuffer(connectionId: Names<T>) {
    this.dataBuffers.set(connectionId, Buffer.alloc(0));
  }

  disconnect(connectionId: Names<T>): void {
    const socket = this.connections.get(connectionId);
    const retryTimeout = this.retryTimeouts.get(connectionId);

    if (retryTimeout) {
      clearTimeout(retryTimeout);
      this.retryTimeouts.delete(connectionId);
    }

    if (socket) {
      socket.end();
      this.connections.delete(connectionId);
    }

    const current = this.connectionStates.get(connectionId);
    if (!current) {
      return;
    }
    current.isConnected = false;
    current.retryCount = 0;
    this.connectionStates.set(connectionId, current);

    this.dataBuffers.delete(connectionId);
    this.configs.delete(connectionId);

    this.emit("connectionClosed", connectionId, undefined);
  }

  getState(key: Names<T>): ConnectionState | undefined;
  getState(): Map<string, ConnectionState>;
  getState(
    key?: Names<T>,
  ): ConnectionState | undefined | Map<Names<T>, ConnectionState> {
    if (typeof key === "string") {
      return this.connectionStates.get(key);
    }
    return new Map(this.connectionStates);
  }

  destroy(): void {
    const connectionIds = Array.from(this.connections.keys());
    connectionIds.forEach((id) => this.disconnect(id));
  }
}

export const BuiltinDelimiters = {
  byteDelimtied: (delimiter: number): DataDelimiter<Buffer[]> => {
    return (buffer: Buffer) => {
      const results: Buffer[] = [];
      let start = 0;

      for (let i = 0; i < buffer.length; i++) {
        if (buffer[i] === delimiter) {
          if (i > start) {
            results.push(buffer.subarray(start, i));
          }
          start = i + 1;
        }
      }

      // If we found at least one delimiter, return the complete chunks
      if (results.length > 0) {
        return results;
      }

      return null; // No complete lines yet
    };
  },

  characterDelimted: (delimiter: string): DataDelimiter<string[]> => {
    return (buffer: Buffer) => {
      const data = buffer.toString("utf8");
      const lines = data.split(delimiter);

      if (lines.length > 1) {
        return lines.slice(0, -1); // Return all complete lines
      }

      return null; // No complete lines yet
    };
  },

  lengthPrefixed: (buffer: Buffer) => {
    if (buffer.length < 4) return null; // Need at least 4 bytes for length

    const length = buffer.readUInt32BE(0);
    if (buffer.length < 4 + length) return null; // Need complete message

    return buffer.subarray(4, 4 + length);
  },

  json: (buffer: Buffer) => {
    try {
      const data = buffer.toString("utf8");
      const parsed = JSON.parse(data);
      return parsed as unknown;
    } catch {
      return null; // Incomplete JSON
    }
  },

  fixedSize: (size: number): DataDelimiter<Buffer> => {
    return (buffer: Buffer) => {
      if (buffer.length >= size) {
        return buffer.subarray(0, size);
      }
      return null;
    };
  },
};
