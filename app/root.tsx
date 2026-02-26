import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { useCopy } from "./routes/auth/lib/copy";

export const links: Route.LinksFunction = () => [
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
];

export default function App() {
  return <Outlet />;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const copy = useCopy();
  const navigate = useNavigate();
  return (
    <html lang="en">
      <head>
        <title>{copy.meta.auth.title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="font-sans bg-[url('/carpark.webp')] bg-center bg-cover bg-fixed min-h-screen p-4 flex items-center justify-start flex-col select-none text-fg">
        <img
          onClick={() => navigate("/")}
          src="/favicon.svg"
          className="py-2 cursor-pointer mx-auto h-10 w-auto"
        />
        {children}
        <Scripts />
        <ScrollRestoration />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let status = 500;
  let message = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    status = error.status;
    message = error.statusText || message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">{status}</h1>
        <p className="mt-4 text-lg text-gray-600">{message}</p>
        <a href="/" className="mt-6 inline-block text-blue-600 hover:underline">
          Go home
        </a>
      </div>
    </div>
  );
}
