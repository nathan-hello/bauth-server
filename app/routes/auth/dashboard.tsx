import { auth } from "@server/auth";
import type { Route } from "./+types/dashboard";
import { Dashboard } from "./components/dashboard";
import { data, redirect } from "react-router";
import { AuthError, getAuthError } from "./errors/auth-error";

export default function ({ loaderData, actionData }: Route.ComponentProps) {
  return <Dashboard actionData={actionData} loaderData={loaderData} />;
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    console.log("[/dashboard loader]: Redirecting to /auth/login (null session)");
    console.log("[/dashboard loader]: headers:");
    console.table(request.headers);
    throw redirect("/auth/login");
  }

  const allSessions = await auth.api.listSessions({
    headers: request.headers,
  });

  const s = allSessions
    .filter((s) => typeof s.ipAddress === "string")
    .map((s) => ({
      id: s.token,
      ipAddress: s.ipAddress ?? "Unknown IP address",
      lastLoggedIn: s.updatedAt,
    }));

  console.log("twoFactorEnabled: ", session.user.twoFactorEnabled);
  return {
    email: {
      email: session.user.email,
      verified: session.user.emailVerified,
    },
    sessions: {
      entries: s,
      current: {
        id: session.session.token,
        ipAddress: session.session.ipAddress ?? "Unknown IP address",
        lastLoggedIn: session.session.updatedAt,
      },
    },
    totp: {
      userEnabled: session.user.twoFactorEnabled ?? false,
    },
  };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();

  const action = form.get("action")?.toString();

  if (!action) {
    return;
  }

  try {
    if (action === "change_password") {
      return await changePassword(form, request);
    }

    if (action === "revoke_session") {
      return await revokeSessions(form, request);
    }

    if (action === "change_email") {
      return await changeEmail(form, request);
    }

    if (action === "get_totp_uri") {
      return await totpGetUri(form, request);
    }

    if (action === "get_backup_codes") {
      return await rerollBackupCodes(form, request);
    }

    if (action === "2fa_enable") {
      return await twoFactorEnable(form, request);
    }
    if (action === "2fa_totp_verify") {
      return await totpVerify(form, request);
    }

    if (action === "2fa_disable") {
      return await twoFactorDisable(form, request);
    }
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    const aerr = getAuthError(error);

    return {
      errors: aerr,
    };
  }
}

async function totpVerify(form: FormData, request: Request) {
  const code = form.get("totp_code")?.toString();
  if (!code) {
    return;
  }

  try {
    const result = await auth.api.verifyTOTP({
      body: { code: code },
      headers: request.headers,
      returnHeaders: true,
    });
    return data(
      {
        totp: {
          enable: true,
        },
      },
      { headers: result.headers },
    );
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    const aerr = getAuthError(error);

    return data({
      totp: {
        enable: true,
        errors: aerr,
      },
    });
  }
}

async function twoFactorDisable(form: FormData, request: Request) {
  const password = form.get("password")?.toString();
  if (!password) {
    return;
  }

  const result = await auth.api.disableTwoFactor({
    body: { password: password },
    headers: request.headers,
    returnHeaders: true,
  });

  return data(
    {
      totp: {
        enable: false,
      },
    },
    { headers: result.headers },
  );
}

async function twoFactorEnable(form: FormData, request: Request) {
  const password = form.get("password")?.toString();
  if (!password) {
    return;
  }

  const result = await auth.api.enableTwoFactor({
    body: { password: password },
    headers: request.headers,
    returnHeaders: true,
  });
  return data(
    {
      totp: {
        enable: true,
        totpURI: result.response.totpURI,
        backupCodes: result.response.backupCodes,
      },
    },
    { headers: result.headers },
  );
}

async function rerollBackupCodes(form: FormData, request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session || !session.user.twoFactorEnabled) {
    return;
  }

  const password = form.get("password")?.toString();
  if (!password) {
    return;
  }

  const result = await auth.api.generateBackupCodes({
    body: { password: password },
    headers: request.headers,
    returnHeaders: true,
  });
  return data(
    {
      totp: {
        backupCodes: result.response.backupCodes,
      },
    },
    { headers: result.headers },
  );
}

async function totpGetUri(form: FormData, request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session || !session.user.twoFactorEnabled) {
    return;
  }

  const password = form.get("password")?.toString();
  if (!password) {
    return;
  }

  const result = await auth.api.getTOTPURI({
    body: { password: password },
    headers: request.headers,
    returnHeaders: true,
  });
  return data(
    {
      totp: {
        totpURI: result.response.totpURI,
      },
    },
    { headers: result.headers },
  );
}

async function changeEmail(form: FormData, request: Request) {
  const newEmail = form.get("new_email")?.toString();

  if (!newEmail) {
    return;
  }

  const result = await auth.api.changeEmail({
    body: { newEmail: newEmail },
    headers: request.headers,
    returnHeaders: true,
  });
  return data({ emailChangeSuccess: result.response.status }, { headers: result.headers });
}

async function revokeSessions(form: FormData, request: Request) {
  const which = form.get("session")?.toString();
  if (!which) {
    return;
  }
  if (which === "all") {
    const result = await auth.api.revokeOtherSessions({
      headers: request.headers,
      returnHeaders: true,
    });
    return data({}, { headers: result.headers });
  }

  const result = await auth.api.revokeSession({
    body: { token: which },
    headers: request.headers,
    returnHeaders: true,
  });
  return data({}, { headers: result.headers });
}

async function changePassword(form: FormData, request: Request) {
  const current = form.get("current")?.toString();
  const newPass = form.get("new_password")?.toString();
  const repeat = form.get("new_password_repeat")?.toString();

  const errors: AuthError[] = [];
  if (!current) {
    throw new AuthError("INVALID_PASSWORD");
  }
  if (!newPass) {
    throw new AuthError("password_mismatch");
  }

  if (newPass && newPass !== repeat) {
    throw new AuthError("password_mismatch");
  }

  if (errors.length > 0) {
  }

  const result = await auth.api.changePassword({
    body: {
      currentPassword: current,
      newPassword: newPass,
      revokeOtherSessions: true,
    },
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
    { headers: result.headers },
  );
}
