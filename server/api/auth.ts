import { auth } from "server/auth";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { safeRequestAttrs, Telemetry } from "@server/telemetry";

const tel = new Telemetry("api.auth");

function errorPage(traceId: string): Response {
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>500 - Server Error</title>
  <style>
    body { margin: 0; background: #282828; color: #e5e5e5; font-family: system-ui, sans-serif; }
    .container { display: flex; min-height: 100vh; align-items: center; justify-content: center; }
    .content { text-align: center; }
    h1 { font-size: 2.5rem; font-weight: bold; margin: 0; }
    p { margin-top: 1rem; color: #928374; }
    .trace { font-size: 0.875rem; color: #7c6f64; margin-top: 0.5rem; }
    a { display: inline-block; margin-top: 1.5rem; color: #689d6a; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <h1>500</h1>
      <p>An unrecoverable error has occurred.</p>
      <p class="trace">Error ID: ${traceId}</p>
      <a href="/">Go home</a>
    </div>
  </div>
</body>
</html>`,
    { status: 500, headers: { "Content-Type": "text/html" } },
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const result = await tel.task("LOADER_HANDLE", async () => {
    return await auth.handler(request);
  });

  tel.info("GET: /api/auth", async () => {
    if (result.ok) {
      const clone = result.data.clone();
      return {
        responseText: await clone.text(),
        status: clone.status,
        url: request.clone().url,
      };
    } else {
      return {
        "http.url": request.clone().url,
        errorName: result.error.name,
        errorMessage: result.error.message,
        errorStack: result.error.stack,
      };
    }
  });

  if (result.ok) {
    return result.data;
  }

  throw errorPage(result.traceId);
}

export async function action({ request }: ActionFunctionArgs) {
  const result = await tel.task("ACTION_HANDLE", async () => {
    return await auth.handler(request);
  });

  tel.info("POST: /api/auth", async () => {
    if (result.ok) {
      const clone = result.data.clone();
      return {
        status: clone.status,
        "http.url": request.clone().url,
         responseText: await clone.text(),
      };
    } else {
      return {
        "http.url": request.clone().url,
        errorName: result.error.name,
        errorMessage: result.error.message,
        errorStack: result.error.stack,
      };
    }
  });

  if (result.ok) {
    return result.data;
  }

  throw errorPage(result.traceId);
}
