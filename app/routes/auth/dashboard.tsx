import { auth } from "@server/auth";
import type { Route } from "./+types/dashboard";
import { Dashboard } from "./components/dashboard";
import { useCopy } from "./lib/copy";
import { data, redirect } from "react-router";
import { AuthError } from "./errors/auth-error";

export default function ({ loaderData, actionData }: Route.ComponentProps) {
  const copy = useCopy();
  return <Dashboard />;
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    throw redirect("/auth/login");
  }

  const allSessions = await auth.api.listSessions({ headers: request.headers });
  const s = allSessions
    .filter((s) => typeof s.ipAddress === "string")
    .map((s) => ({ id: s.id, ipAddress: s.ipAddress as string, lastLoggedIn: s.updatedAt }));

  return {
    email: {
      email: session.user.email,
      verified: session.user.emailVerified,
    },
    sessions: s,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();

  const action = form.get("action")?.toString();

  if (!action) {
    return;
  }

  if (action === "change_password") {
    return await changePassword(form, request)
  }

  if (action === "revoke_session") {
    return await revokeSessions(form, request);
  }
  
  if (action === "change_email") {
    return await changeEmail(form, request);
  }

  if (action === "get_totp_uri") {
      return await getTotpUri(form, request);
  }

  if (action === "get_backup_codes") {
    return await getBackupCodes(form, request)
  }

  if (action === "2fa_totp_enable") {}
  if (action === "2fa_totp_verify") {}
  if (action === "2fa_totp_disable") {}
  if (action === "2fa_email_disable") {}

}


async function getBackupCodes(form: FormData, request: Request) {
  const password = form.get("password")?.toString();
  if (!password) {
    return;
  }

  const asdf = await auth.api.generateBackupCodes({body: {password: password}, headers: request.headers})
  return {
    backupCodes: asdf.backupCodes
  }
}

async function getTotpUri(form: FormData, request: Request) {
  const password = form.get("password")?.toString();
  if (!password) {
    return;
  }

  const asdf = await auth.api.getTOTPURI({body: {password: password}, headers: request.headers})
  return {
    totp_uri: asdf.totpURI
  }
}

async function changeEmail(form: FormData, request: Request) {
  const newEmail = form.get("new_email")?.toString();

  if (!newEmail) {
    return;
  }
  
  await auth.api.changeEmail({body: {newEmail: newEmail}, headers: request.headers});
  return;
}

async function revokeSessions(form: FormData, request: Request) {
    const which = form.get("session")?.toString();
    if (!which) {
      return;
    }
    if (which === "all") {
      await auth.api.revokeOtherSessions({headers: request.headers})
      return;
    }

    await auth.api.revokeSession({body: {token: which}, headers: request.headers})
  return;
}

async function changePassword(form: FormData, request: Request) {
    const current = form.get("current")?.toString();
    const newPass = form.get("new_password")?.toString();
    const repeat = form.get("new_password_repeat")?.toString();

    const errors: AuthError[] = [];
    if (!current) {
    throw new AuthError("INVALID_PASSWORD")
    }
    if (!newPass) {
    throw new AuthError("password_mismatch")
    }

    if (newPass && newPass !== repeat) {
    throw new AuthError("password_mismatch")
    }

    if (errors.length > 0) {
    }

    const asdf = await auth.api.changePassword({
      body: { currentPassword: current, newPassword: newPass, revokeOtherSessions: true },
    headers: request.headers,
      returnHeaders: true,
    });

    return data(
      {
        change_password: {
          errors: undefined,
          success: true,
        },
      },
      { headers: asdf.headers },
    );
}
