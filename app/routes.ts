import {
  type RouteConfig,
  route,
  layout,
  index,
  prefix,
} from "@react-router/dev/routes";

export default [
  index("./routes/home.tsx"),

  ...prefix("auth", [
    layout("./routes/auth/components/layout.tsx", [
      route("login", "./routes/auth/login.tsx"),
      route("register", "./routes/auth/register.tsx"),
      route("logout", "./routes/auth/logout.tsx"),
      route("forgot", "./routes/auth/forgot.tsx"),
      route("2fa", "./routes/auth/factor.tsx"),
    ]),
  ]),

  route("api/trpc/*", "./api/trpc.ts"),
  route("api/auth/*", "./api/auth.ts"),
] satisfies RouteConfig;
