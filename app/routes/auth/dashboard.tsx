import { auth } from "@server/auth";
import type { Route } from "./+types/dashboard";
import { Dashboard } from "./components/dashboard";
import { data, redirect } from "react-router";
import { AppError, getAuthError, errorAttrs } from "./errors/auth-error";
import { copy, useCopy } from "@/lib/copy";
import { Telemetry, safeRequestAttrs } from "@server/telemetry";

const tel = new Telemetry("route.dashboard");

export default function ({ loaderData, actionData }: Route.ComponentProps) {
  const c = useCopy();
  return (
    <>
      <title>{c.routes.dashboard.title}</title>
      <Dashboard actionData={actionData} loaderData={loaderData} />
    </>
  );
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    tel.info("REDIRECT", { reason: "null_session", ...safeRequestAttrs(request) });
    throw redirect("/auth/login");
  }

  tel.info("GOT_LOADER", { "user.id": session.user.id, ...safeRequestAttrs(request) });

  const allSessions = await auth.api.listSessions({
    headers: request.headers,
  });

  const s = allSessions
    .filter((s) => typeof s.ipAddress === "string")
    .map((s) => ({
      id: s.token,
      ipAddress: s.ipAddress ?? copy.dashboard_unknown_ip,
      lastLoggedIn: s.updatedAt,
    }));

  return {
    email: {
      email: session.user.email,
      verified: session.user.emailVerified,
    },
    sessions: {
      entries: s,
      current: {
        id: session.session.token,
        ipAddress: session.session.ipAddress ?? copy.dashboard_unknown_ip,
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
    tel.warn("MISSING_FIELD", { field: "action", ...safeRequestAttrs(request) });
    return;
  }

  tel.info("GOT_ACTION", { action, ...safeRequestAttrs(request, form) });

  try {
    if (action === "change_password") {
      return await changePassword(form, request);
    }

    if (action === "revoke_session") {
      return await revokeSessions(form, request);
    }

    if (action === "email_change") {
      return await changeEmail(form, request);
    }

    if (action === "get_totp_uri") {
      return await totpGetUri(form, request);
    }

    if (action === "get_backup_codes") {
      return await rerollBackupCodes(form, request);
    }

    if (action === "email_resend_verification") {
      return await emailResendVerification(form, request);
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

    tel.error("ACTION_ERROR", errorAttrs(error));
    const aerr = getAuthError(error);

    return {
      errors: aerr,
    };
  }
}

async function emailResendVerification(_: FormData, request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    return;
  }

  await auth.api.sendVerificationEmail({
    body: {
      email: session.user.email,
    },
  });

  return data({
    email_verify: {
      sent: true,
    },
  });
}

async function totpVerify(form: FormData, request: Request) {
  const code = form.get("totp_code")?.toString();
  if (!code) {
    return;
  }

  const totpURI = form.get("totp_uri")?.toString();
  const backupCodesRaw = form.get("backup_codes")?.toString();
  const intermediateEnable = form.get("intermediate_enable") === "true";

  try {
    const result = await auth.api.verifyTOTP({
      body: { code: code },
      headers: request.headers,
      returnHeaders: true,
    });
    return data(
      {
        totp: {
          verified: true,
          ...(totpURI && { totpURI }),
        },
      },
      { headers: result.headers },
    );
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }

    tel.error("TOTP_VERIFY_ERROR", errorAttrs(error));
    const aerr = getAuthError(error);
    const backupCodes = backupCodesRaw ? JSON.parse(backupCodesRaw) : undefined;

    return data({
      totp: {
        ...(intermediateEnable && { intermediateEnable: true }),
        ...(totpURI && { totpURI }),
        ...(backupCodes && { backupCodes }),
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
        intermediateEnable: true,
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
    tel.warn("MISSING_FIELD", { field: "session_or_2fa", action: "get_totp_uri" });
    return;
  }

  const password = form.get("password")?.toString();
  if (!password) {
    tel.warn("MISSING_FIELD", { field: "password", action: "get_totp_uri" });
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

  if (!current) {
    throw new AppError("INVALID_PASSWORD");
  }
  if (!newPass) {
    throw new AppError("password_mismatch");
  }
  if (newPass && newPass !== repeat) {
    throw new AppError("password_mismatch");
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
