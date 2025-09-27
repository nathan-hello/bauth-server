import {
  type RouteConfig,
  route,
  layout,
  index,
  prefix,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  ...prefix("auth", [
    layout("./routes/auth/components/layout.tsx", [
      route("signin", "routes/auth/signin.tsx"),
      route("signup", "routes/auth/signup.tsx"),
      route("signout", "routes/auth/signout.tsx"),
      route("forgot", "routes/auth/forgot.tsx"),
    ]),
  ]),

  route("api/trpc/*", "./api/trpc.ts"),
  route("api/auth/*", "./api/auth.ts"),
] satisfies RouteConfig;
