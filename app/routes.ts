import { type RouteConfig, route, layout, index, prefix } from "@react-router/dev/routes";

export default [
  index("./routes/home.tsx"),

  ...prefix("auth", [
    layout("./routes/auth/components/layout.tsx", [
      route("login", "./routes/auth/login.tsx"),
      route("login/2fa", "./routes/auth/login-2fa.tsx"),
      route("register", "./routes/auth/register.tsx"),
      route("logout", "./routes/auth/logout.tsx"),
      route("forgot", "./routes/auth/forgot.tsx"),
      route("dashboard", "./routes/auth/dashboard.tsx"),
    ]),
  ]),

  route("api/trpc/*", "../server/api/trpc.ts"),
  route("api/auth/*", "../server/api/auth.ts"),
] satisfies RouteConfig;
