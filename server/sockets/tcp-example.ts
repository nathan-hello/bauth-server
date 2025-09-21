import { TCPFactory, BuiltinDelimiters, type IoTcp, createIoTcp } from "./tcp";

const tcps = [
  createIoTcp({
    name: "server1",
    hostname: "localhost",
    port: 8080,
    delimiter: BuiltinDelimiters.characterDelimted("\n"),
    on: {
      connected: (_) => console.log("✅ Connected: server1"),
      disconnected: (_, error) =>
        console.log("❌ Disconnected: server1", error?.message),
      receive: (_, parsedData) =>
        console.log("📦 Data from server1:", parsedData.data),
      error: (_, error) =>
        console.error("🚨 Error in server1:", JSON.stringify(error)),
      retryScheduled: (_, payload: { delay: number; retryCount: number }) =>
        console.log(
          `🔄 Retry scheduled for server1 in ${payload.delay}ms (attempt ${payload.retryCount})`,
        ),
    },
  }),
  createIoTcp({
    name: "api-server",
    hostname: "api.example.com",
    port: 9090,
    delimiter: BuiltinDelimiters.json,
    on: {
      connected: (_) => console.log("✅ Connected: api-server"),
      disconnected: (_, error) =>
        console.log("❌ Disconnected: api-server", error?.message),
      receive: (_, parsedData) =>
        console.log("📦 Data from api-server:", parsedData.data),
      error: (_, error) =>
        console.error("🚨 Error in api-server:", JSON.stringify(error)),
      retryScheduled: (_, payload) =>
        console.log(
          `🔄 Retry scheduled for api-server in ${payload.delay}ms (attempt ${payload.retryCount})`,
        ),
    },
  }),
  createIoTcp({
    name: "binary-server",
    hostname: "binary.example.com",
    port: 7777,
    delimiter: BuiltinDelimiters.byteDelimtied(0x20),
    on: {
      connected: (_) => console.log("✅ Connected: binary-server"),
      disconnected: (_, error) =>
        console.log("❌ Disconnected: binary-server", error?.message),
      receive: (_, rx) => console.log("📦 Data from binary-server:", rx.data),
      error: (_, error) =>
        console.error("🚨 Error in binary-server:", JSON.stringify(error)),
      retryScheduled: (_, payload) =>
        console.log(
          `🔄 Retry scheduled for binary-server in ${payload.delay}ms (attempt ${payload.retryCount})`,
        ),
    },
  }),
  createIoTcp({
    name: "custom-server",
    hostname: "custom.example.com",
    port: 5555,
    delimiter: BuiltinDelimiters.json,
    on: {
      connected: (_) => console.log("✅ Connected: custom-server"),
      disconnected: (_, error) =>
        console.log("❌ Disconnected: custom-server", error?.message),
      receive: (_, parsedData) =>
        console.log("📦 Data from custom-server:", parsedData.data),
      error: (_, error) =>
        console.error("🚨 Error in custom-server:", JSON.stringify(error)),
      retryScheduled: (_, payload) =>
        console.log(
          `🔄 Retry scheduled for custom-server in ${payload.delay}ms (attempt ${payload.retryCount})`,
        ),
    },
  }),
] as const;

const factory = new TCPFactory(tcps);

// Send some data after connections are established
setTimeout(async () => {
  // Send data to different connections
  await factory.write("custom-server", "Hello, server!\n");
  await factory.write(
    "custom-server",
    JSON.stringify({ action: "ping", timestamp: Date.now() }),
  );
  await factory.write(
    "binary-server",
    Buffer.from([0x00, 0x00, 0x00, 0x05, 0x48, 0x65, 0x6c, 0x6c, 0x6f]),
  ); // "Hello"

  // Custom protocol message
  const customMessage = Buffer.alloc(9);
  customMessage.writeUInt32BE(4, 0); // Length: 4 bytes
  customMessage.writeUInt8(1, 4); // Type: 1
  customMessage.write("test", 5); // Data: "test"
  await factory.write("custom-server", new Uint8Array([0b1000, ]));
}, 2000);

// Monitor connection states
setInterval(() => {
  const states = factory.getState();
  console.log("\n📊 Connection States:");
  for (const [id, state] of states) {
    console.log(
      `  ${id}: ${state.isConnected ? "🟢" : "🔴"} Connected: ${state.isConnected}, Retries: ${state.retryCount}, Bytes RX: ${state.totalBytesReceived}, Bytes TX: ${state.totalBytesSent}`,
    );
  }
}, 10000);

// Graceful shutdown after 60 seconds
setTimeout(() => {
  console.log("\n🛑 Shutting down...");
  factory.destroy();
  process.exit(0);
}, 60000);
