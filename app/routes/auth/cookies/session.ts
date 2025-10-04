import { createCookie, redirect } from "react-router";

export async function throwRedirectSessionToken(headers: Headers) {
        
  throw redirect("/chat", {
    headers: headers,
  });
}
