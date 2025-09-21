import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("auth/signin", "routes/auth/signin.tsx"),
  route("auth/signup", "routes/auth/signup.tsx"),
  route("auth/signout", "routes/auth/signout.tsx"),
  route("api/trpc/*", "./api/trpc.ts"),
  route("api/auth/*", "./api/auth.ts"),
] satisfies RouteConfig;
