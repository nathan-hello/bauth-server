import { auth } from "@server/auth";
import type { Route } from "./+types/login";
import { PasswordLoginForm, type AuthState } from "./components/password";
import { redirect } from "react-router";
import { AppError, getAuthError } from "./errors/auth-error";
import { useCopy } from "./lib/copy";
import { throwRedirectIfSessionExists } from "./lib/redirect";
import { Card } from "./components/ui";
import { Telemetry, safeRequestAttrs } from "@server/telemetry";

const tel = new Telemetry("route.login");

export default function ({ actionData }: Route.ComponentProps) {
  const copy = useCopy();

  return (
    <>
      <title>{copy.meta.login.title}</title>
      <Card>
        <PasswordLoginForm state={actionData} />
      </Card>
    </>
  );
}

export async function loader({ request }: Route.LoaderArgs) {
  tel.info("GOT_LOADER", safeRequestAttrs(request));
  await throwRedirectIfSessionExists({
    request,
    caller: "/auth/login",
  });
}

export async function action({ request }: Route.ActionArgs): Promise<AuthState> {
  const form = await request.formData();
  tel.info("GOT_ACTION", safeRequestAttrs(request, form));

  const email = form.get("email")?.toString();
  const password = form.get("password")?.toString();

  if (!email || !password) {
    return {
      email: email || "",
      errors: [
        {
          type: "INVALID_EMAIL_OR_PASSWORD",
        },
      ],
    };
  }

  try {
    // Determine if input is email or username based on @ symbol
    const isEmail = email.includes("@");

    const { headers, response } = await (isEmail ?
      auth.api.signInEmail({
        headers: request.headers,
        body: {
          email: email,
          password: password,
        },
        returnHeaders: true,
      })
    : auth.api.signInUsername({
        headers: request.headers,
        body: {
          username: email,
          password: password,
        },
        returnHeaders: true,
      }));

    if (!response) {
      throw new AppError("generic_error");
    }

    if ("twoFactorRedirect" in response) {
      throw redirect("/auth/2fa", {
        headers,
      });
    }

    throw redirect("/", { headers });
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    const aerr = getAuthError(error);

    return {
      email: email,
      errors: aerr,
    };
  }
}
