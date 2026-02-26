import { type RouteConfig, route, layout, index, prefix } from "@react-router/dev/routes";

export default [
  index("./routes/home.tsx"),

  ...prefix("auth", [
    route("login", "./routes/auth/login.tsx"),
    route("register", "./routes/auth/register.tsx"),
    route("logout", "./routes/auth/logout.tsx"),
    route("forgot", "./routes/auth/forgot.tsx"),
    route("dashboard", "./routes/auth/dashboard.tsx"),
    route("2fa", "./routes/auth/2fa.tsx"),
  ]),

  ...(process.env.NODE_ENV === "development" ?
    [route("debug/email", "./routes/debug/email.tsx")]
  : []),
  route("api/auth/*", "../server/api/auth.ts"),
] satisfies RouteConfig;
