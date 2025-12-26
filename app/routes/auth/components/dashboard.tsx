import { FormAlert } from "./form";
import { useCopy } from "../lib/copy";
import type { AuthError } from "../errors/auth-error";
import { Form } from "react-router";
import { QRCode } from "@/components/qr";
import { useState, useEffect } from "react";

export type DashboardActionData = {
  errors?: AuthError[];
  change_password?: {
    success: boolean;
  };
  totp?: {
    errors?: AuthError[];
    enable: boolean;
    backupCodes?: string[];
    totpUri?: string;
    userEnabled?: boolean;
  };
};

type DashboardLoaderData = {
  email: {
    email: string;
    verified: boolean;
  };
  sessions: {
    entries: Session[];
    current: Session;
  };
  totp: {
    userEnabled: boolean;
  };
};

type DashboardProps = {
  actionData?: DashboardActionData;
  loaderData: DashboardLoaderData;
};

export function Dashboard({ actionData, loaderData }: DashboardProps) {
  const copy = useCopy();

  console.log("errors: ", actionData?.errors);

  return (
    <div className="gap-8 mx-auto p-6 select-text h-full w-[36rem] bg-black">
      <h1 className="text-2xl font-bold">Account Dashboard</h1>

      {/* Global errors */}
      {actionData?.errors?.map((error) => (
        <FormAlert
          key={error.type}
          message={error.type ? copy.error[error.type] : undefined}
          submessage={error.type === "generic_error" ? error.message : ""}
        />
      ))}

      {/* Success messages */}
      {actionData?.change_password?.success && (
        <FormAlert color="success" message="Password changed successfully" />
      )}

      <div className="flex flex-col gap-16">
        <EmailSection email={loaderData.email} />
        <TwoFactorSection state={{ ...loaderData.totp, ...actionData?.totp }} />
        <PasswordSection />
        <SessionsSection
          sessions={loaderData.sessions.entries}
          current={loaderData.sessions.current}
        />
      </div>
    </div>
  );
}

type EmailData = {
  email: string;
  verified: boolean;
};

function EmailSection({ email }: { email: EmailData }) {
  return (
    <section className="border rounded-lg p-4 bg-gray-800">
      <h2 className="text-xl font-semibold mb-4">Email</h2>
      <div className="mb-4">
        <p className="text-sm">Current email: {email.email}</p>
        <p className="text-sm">Status: {email.verified ? "Verified" : "Not verified"}</p>
      </div>

      <ChangeEmailForm />
    </section>
  );
}

function ChangeEmailForm() {
  return (
    <Form method="post" className="flex flex-col gap-2">
      <input type="hidden" name="action" value="change_email" />
      <label htmlFor="new_email" className="text-sm font-medium">
        Change Email
      </label>
      <input
        data-component="input"
        type="email"
        name="new_email"
        id="new_email"
        placeholder="New email address"
        required
      />
      <button data-component="button" type="submit">
        Change Email
      </button>
    </Form>
  );
}

function PasswordSection() {
  return (
    <section className="border rounded-lg p-4 bg-gray-800">
      <h2 className="text-xl font-semibold mb-4">Password</h2>
      <ChangePasswordForm />
    </section>
  );
}

function ChangePasswordForm() {
  return (
    <Form method="post" className="flex flex-col gap-2">
      <input type="hidden" name="action" value="change_password" />

      <label htmlFor="current" className="text-sm font-medium">
        Current Password
      </label>
      <input
        data-component="input"
        type="password"
        name="current"
        id="current"
        placeholder="Current password"
        required
        autoComplete="current-password"
      />

      <label htmlFor="new_password" className="text-sm font-medium">
        New Password
      </label>
      <input
        data-component="input"
        type="password"
        name="new_password"
        id="new_password"
        placeholder="New password"
        required
        autoComplete="new-password"
      />

      <label htmlFor="new_password_repeat" className="text-sm font-medium">
        Repeat New Password
      </label>
      <input
        data-component="input"
        type="password"
        name="new_password_repeat"
        id="new_password_repeat"
        placeholder="Repeat new password"
        required
        autoComplete="new-password"
      />

      <button data-component="button" type="submit">
        Change Password
      </button>
    </Form>
  );
}

type TotpState = {
  enable?: boolean;
  totpURI?: string;
  backupCodes?: string[];
  userEnabled: boolean;
  errors?: AuthError[];
};

function TwoFactorSection({ state }: { state?: TotpState }) {
  const [totpURI, setTotpURI] = useState<string | undefined>(state?.totpURI);
  const [backupCodes, setBackupCodes] = useState<string[] | undefined>(state?.backupCodes);
  const copy = useCopy();

  useEffect(() => {
    if (state?.totpURI) {
      setTotpURI(state.totpURI);
    }
    if (state?.backupCodes) {
      setBackupCodes(state.backupCodes);
    }
    if (state?.userEnabled) {
      setTotpURI(undefined);
      setBackupCodes(undefined);
    }
    if (state?.enable === false) {
      setTotpURI(undefined);
      setBackupCodes(undefined);
    }
  }, [state?.totpURI, state?.backupCodes, state?.userEnabled, state?.enable]);

  return (
    <section className="border rounded-lg p-4 bg-gray-800">
      <h2 className="text-xl font-semibold mb-4">Two-Factor Authentication</h2>

      {!state?.enable && (
        <div className="flex flex-col gap-2 py-2">
          <h1>
            When you enable 2FA, you will use an authenticator app (TOTP) or receive a code by
            email.
          </h1>
          <h1>
            To turn on email 2FA, you must first set up and verify TOTP using the QR code secret.
          </h1>
        </div>
      )}

      {!state?.enable && <EnableTwoFactorForm />}

      {state?.enable && state.userEnabled && <h1>Two factor is enabled.</h1>}
      {state?.enable && !state.userEnabled && <h1>Verify using the QR code to enable 2FA</h1>}

      {totpURI && (
        <>
          <TotpQRCodeDisplay totpURI={totpURI} />
          <VerifyTotpForm errors={state?.errors} />
        </>
      )}

      {backupCodes && backupCodes.length > 0 && <BackupCodesDisplay codes={backupCodes} />}

      {state?.enable && !totpURI && <GetTotpUriForm />}

      {state?.enable && <RegenerateBackupCodesForm />}

      {state?.enable && <DisableTwoFactorForm />}
    </section>
  );
}

function EnableTwoFactorForm() {
  return (
    <div className="mb-6">
      <Form method="post" className="flex flex-col gap-2">
        <input type="hidden" name="action" value="2fa_enable" />
        <input
          data-component="input"
          type="password"
          name="password"
          id="password_2fa_enable"
          placeholder="Password"
          required
          autoComplete="current-password"
        />

        <button data-component="button" type="submit">
          Enable 2FA
        </button>
      </Form>
    </div>
  );
}

function TotpQRCodeDisplay({ totpURI }: { totpURI: string }) {
  return (
    <div className="">
      <p className="text-sm py-6">
        Scan this QR code with your authenticator app. Click to show the secret in text.
      </p>
      <div className="flex justify-center mb-4">
        <QRCode className="w-[200px] h-[200px]" data={totpURI} />
      </div>
    </div>
  );
}

function VerifyTotpForm({ errors }: { errors?: AuthError[] }) {
  const copy = useCopy();
  return (
    <Form method="post" className="flex flex-col gap-2 mb-6">
      <input type="hidden" name="action" value="2fa_totp_verify" />

      <label htmlFor="totp_code" className="text-sm font-medium">
        Verify with a code from your app
      </label>
      {errors?.map((error) => {
        return (
          <FormAlert
            key={error.type}
            message={error.type ? copy.error[error.type] : undefined}
            submessage={error.type === "generic_error" ? error.message : ""}
          />
        );
      })}
      <input
        data-component="input"
        type="text"
        name="totp_code"
        id="totp_code"
        placeholder="6-digit code"
        minLength={6}
        maxLength={6}
        required
        autoComplete="one-time-code"
      />

      <button data-component="button" type="submit">
        Verify Code
      </button>
    </Form>
  );
}

function BackupCodesDisplay({ codes }: { codes: string[] }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-6 p-4">
      <div className="flex flex-row justify-between">
        <h3 className="text-lg font-medium mb-2">Backup Codes</h3>
        <button
          data-component="button"
          className="px-4 py-2"
          onClick={() => {
            navigator.clipboard.writeText(codes.join("\n")).then(() => {
              setCopied(true);
            });
          }}
        >
          {copied ? "Copied" : "Copy All"}
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Save these codes in a secure place. Each can be used once if you lose access to your
        authenticator.
      </p>
      <button className="w-full mb-2" data-component="button" onClick={() => setOpen(!open)}>
        {open ? "Hide backup codes" : "Show backup codes"}
      </button>
      {open && (
        <div className="font-mono text-sm grid grid-cols-2 gap-2">
          {codes.map((code, idx) => (
            <span key={idx} className="p-2 rounded border text-white ">
              {code}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function GetTotpUriForm() {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Get QR Code</h3>
      <Form method="post" className="flex flex-col gap-2">
        <input type="hidden" name="action" value="get_totp_uri" />

        <input
          data-component="input"
          type="password"
          name="password"
          id="password_get_uri"
          placeholder="Password"
          required
          autoComplete="current-password"
        />

        <button data-component="button" type="submit">
          Show QR Code
        </button>
      </Form>
    </div>
  );
}

function RegenerateBackupCodesForm() {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Regenerate Backup Codes</h3>
      <h1 className="text-sm font-medium mb-2">This will invalidate your previous backup codes.</h1>
      <Form method="post" className="flex flex-col gap-2">
        <input type="hidden" name="action" value="get_backup_codes" />

        <input
          data-component="input"
          type="password"
          name="password"
          id="password_backup"
          placeholder="Password"
          required
          autoComplete="current-password"
        />

        <button data-component="button" type="submit">
          Get New Backup Codes
        </button>
      </Form>
    </div>
  );
}

function DisableTwoFactorForm() {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Disable two factor authentication.</h3>
      <h1 className="text-xs font-medium mb-2">
        Consider using a Passkey before disabling two factor authentication.
      </h1>
      <Form method="post" className="flex flex-col gap-2">
        <input type="hidden" name="action" value="2fa_disable" />

        <input
          data-component="input"
          type="password"
          name="password"
          id="password_2fa_disable"
          placeholder="Password"
          required
          autoComplete="current-password"
        />

        <button data-component="button" type="submit">
          Disable 2FA
        </button>
      </Form>
    </div>
  );
}

type Session = {
  id: string;
  ipAddress: string;
  lastLoggedIn: Date;
};

function SessionsSection({ sessions, current }: { sessions: Session[]; current: Session }) {
  return (
    <section className="border rounded-lg p-4 bg-gray-800">
      <h2 className="text-xl font-semibold mb-4">Active Sessions</h2>

      {sessions.length > 0 ?
        <>
          <SessionsList sessions={sessions} current={current} />
          {sessions.length > 1 && <RevokeAllSessionsForm />}
        </>
      : <p className="text-gray-600 mb-4">No active sessions</p>}
    </section>
  );
}

function SessionsList({ sessions, current }: { sessions: Session[]; current: Session }) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      {sessions.map((session) => (
        <div key={session.id} className="flex flex-col overflow-scroll">
          <div>
            <p className="font-medium">{session.ipAddress}</p>
            {session.id === current.id && <p>Current session</p>}
            <p className="text-sm text-gray-600">
              Last active: {new Date(session.lastLoggedIn).toLocaleString()}
            </p>
          </div>
          <RevokeSessionForm sessionId={session.id} />
        </div>
      ))}
    </div>
  );
}

function RevokeSessionForm({ sessionId }: { sessionId: string }) {
  return (
    <Form method="post">
      <input type="hidden" name="action" value="revoke_session" />
      <input type="hidden" name="session" value={sessionId} />
      <button data-component="button" type="submit" className="text-sm w-full">
        Revoke
      </button>
    </Form>
  );
}

function RevokeAllSessionsForm() {
  return (
    <Form method="post">
      <input type="hidden" name="action" value="revoke_session" />
      <input type="hidden" name="session" value="all" />
      <button data-component="button" type="submit">
        Revoke All Other Sessions
      </button>
    </Form>
  );
}
