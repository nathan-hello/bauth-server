import { createAuthClient } from "better-auth/react";
import { passkeyClient, usernameClient, twoFactorClient, oneTimeTokenClient, jwtClient, emailOTPClient} from "better-auth/client/plugins"
import { url } from "@/lib/url";

export const authClient = createAuthClient({
  baseURL: url,
  plugins: [passkeyClient(), usernameClient(), emailOTPClient(), twoFactorClient(), oneTimeTokenClient(), jwtClient()]
});
