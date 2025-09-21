import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
  baseURL: "http://localhost:5173",
});

export const { signIn, signUp, linkSocial, deleteUser, signOut } =
  createAuthClient();
