import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  prerender(args) {
    return [
      ...args.getStaticPaths(),
      "/auth/login",
      "/auth/register",
      "/auth/logout",
      "/auth/forgot",
      "/auth/2fa",
    ];
  },
} satisfies Config;
