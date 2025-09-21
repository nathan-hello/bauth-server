import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import { TRPCProvider } from "@/lib/trpc";
import "./app.css";
import {Layout as OALayout} from "@/components/base"

export const links: Route.LinksFunction = () => [
];

export default function App() {
  return (
    <TRPCProvider>
      <Outlet />
    </TRPCProvider>
  );
}

export const Layout = OALayout


export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (error instanceof Response) {
    console.log(JSON.stringify(error, null, 2));
    error.json().then((data) => {
      message = data.message;
      details = data.details;
      stack = data.stack;
    });
  }

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
