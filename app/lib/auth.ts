import { createAuthClient } from "better-auth/react";
import { passkeyClient, usernameClient, twoFactorClient, oneTimeTokenClient, jwtClient, emailOTPClient} from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: VITE_URL,
  plugins: [passkeyClient(), usernameClient(), emailOTPClient(), twoFactorClient(), oneTimeTokenClient(), jwtClient()]
});
