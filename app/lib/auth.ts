import { createAuthClient } from "better-auth/react";
import { passkeyClient, usernameClient, twoFactorClient, oneTimeTokenClient, jwtClient} from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: "http://localhost:5173",
  plugins: [passkeyClient(), usernameClient(), twoFactorClient(), oneTimeTokenClient(), jwtClient()]
});
