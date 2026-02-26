import { auth } from "server/auth";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { safeRequestAttrs, Telemetry } from "@server/telemetry";

const tel = new Telemetry("api.auth");

export async function loader({ request }: LoaderFunctionArgs) {
  tel.info("GOT_LOADER", safeRequestAttrs(request));
  const result = await tel.task("LOADER_HANDLE", async () => {
    throw new Error("asdf");
    return await auth.handler(request);
  });

  if (result.ok) {
    return result.data;
  }

  throw new Response("AUTHENTICATION_FAILURE", {
    status: 500,
    statusText: `An unrecoverable error has occurred. Error ID: ${result.traceId}`,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  tel.info("GOT_ACTION", safeRequestAttrs(request));
  const result = await tel.task("LOADER_HANDLE", async () => {
    throw new Error("asdf");
    return await auth.handler(request);
  });

  if (result.ok) {
    return result.data;
  }

  throw new Response("AUTHENTICATION_FAILURE", {
    status: 500,
    statusText: `An unrecoverable error has occurred. Error ID: ${result.traceId}`,
  });
}
