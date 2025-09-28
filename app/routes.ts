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
      route("login", "./routes/auth/signin.tsx"),
      route("register", "./routes/auth/signup.tsx"),
      route("logout", "./routes/auth/signout.tsx"),
      route("forgot", "./routes/auth/forgot.tsx"),
      route("2fa", "./routes/auth/factor.tsx"),
    ]),
  ]),

  route("api/trpc/*", "./api/trpc.ts"),
  route("api/auth/*", "./api/auth.ts"),
] satisfies RouteConfig;
