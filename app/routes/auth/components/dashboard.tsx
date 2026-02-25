import { FormAlert } from "./form";
import { useCopy } from "../lib/copy";
import type { AuthError } from "../errors/auth-error";
import { Form } from "react-router";
import { QRCode } from "@/components/qr";
import { useState, useEffect } from "react";
import { Input, Button } from "./ui";

export type DashboardActionData = {
  errors?: AuthError[];
  change_password?: {
    success: boolean;
  };
  email_verify?: {
    sent: boolean;
  };
  totp?: TotpState;
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

  return (
    <div className="w-full max-w-3xl mx-auto select-text py-6 px-4">
      <div className="bg-surface text-fg">
        <header className="px-6 pt-6 pb-5 border-b border-border">
          <p className="uppercase tracking-[0.3em] mb-1">Account Settings</p>
        </header>

        <div className="px-6 py-4 flex flex-col gap-2">
          {actionData?.errors?.map((error) => (
            <FormAlert
              key={error.type}
              message={error.type ? copy.error[error.type] : undefined}
              submessage={error.type === "generic_error" ? error.message : ""}
            />
          ))}
          {actionData?.change_password?.success && (
            <FormAlert color="success" message="Password changed successfully" />
          )}
        </div>

        <div className="divide-y divide-border">
          <EmailSection
            email={loaderData.email}
            verificationSent={actionData?.email_verify?.sent}
          />
          <PasswordSection />
          <TwoFactorSection state={{ ...loaderData.totp, ...actionData?.totp }} />
          <SessionsSection
            sessions={loaderData.sessions.entries}
            current={loaderData.sessions.current}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Section heading ─── */

function SectionHeading({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-fg-faint">
        {children}
      </h2>
      {right}
    </div>
  );
}

/* ─── Status badge ─── */

function Badge({
  children,
  color,
}: {
  children: React.ReactNode;
  color: "green" | "yellow" | "blue" | "gray";
}) {
  const styles = {
    green: "bg-success/15 text-success",
    yellow: "bg-warning/15 text-warning",
    blue: "bg-info/15 text-info",
    gray: "bg-surface-overlay text-fg-muted",
  };
  return (
    <span
      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 font-medium ${styles[color]}`}
    >
      {children}
    </span>
  );
}

/* ─── Email ─── */

type EmailData = {
  email: string;
  verified: boolean;
};

function EmailSection({
  email,
  verificationSent,
}: {
  email: EmailData;
  verificationSent?: boolean;
}) {
  return (
    <section className="px-6 py-5">
      <SectionHeading
        right={
          <Badge color={email.verified ? "green" : "yellow"}>
            {email.verified ? "Verified" : "Unverified"}
          </Badge>
        }
      >
        Email
      </SectionHeading>

      <p className="text-sm mb-5">{email.email}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form method="post" className="flex flex-col gap-2">
          <input type="hidden" name="action" value="email_change" />
          <label htmlFor="new_email" className="text-xs text-fg-muted">
            Change Email
          </label>
          <Input
            type="email"
            name="new_email"
            id="new_email"
            placeholder="New email address"
            required
          />
          <Button type="submit">Change Email</Button>
        </Form>

        {!email.verified && (
          <Form method="post" className="flex flex-col gap-2">
            <input type="hidden" name="action" value="email_resend_verification" />
            <label htmlFor="new_email" className="text-xs text-fg-muted">
              {verificationSent ? "Email verification sent." : "Email unverified."}
            </label>
            <Button disabled={verificationSent} type="submit">
              Resend Email Verification
            </Button>
          </Form>
        )}
      </div>
    </section>
  );
}

/* ─── Password ─── */

function PasswordSection() {
  return (
    <section className="px-6 py-5">
      <SectionHeading>Password</SectionHeading>
      <Form method="post" className="flex flex-col gap-2 max-w-sm">
        <input type="hidden" name="action" value="change_password" />

        <label htmlFor="current" className="text-xs text-fg-muted">
          Current Password
        </label>
        <Input
          type="password"
          name="current"
          id="current"
          placeholder="Current password"
          required
          autoComplete="current-password"
        />

        <label htmlFor="new_password" className="text-xs text-fg-muted">
          New Password
        </label>
        <Input
          type="password"
          name="new_password"
          id="new_password"
          placeholder="New password"
          required
          autoComplete="new-password"
        />

        <label htmlFor="new_password_repeat" className="text-xs text-fg-muted">
          Repeat New Password
        </label>
        <Input
          type="password"
          name="new_password_repeat"
          id="new_password_repeat"
          placeholder="Repeat new password"
          required
          autoComplete="new-password"
        />

        <Button type="submit">Change Password</Button>
      </Form>
    </section>
  );
}

type TotpState = {
  intermediateEnable?: boolean;
  totpURI?: string;
  backupCodes?: string[];
  userEnabled: boolean;
  errors?: AuthError[];
};

function TwoFactorSection({ state }: { state?: TotpState }) {
  const [totpURI, setTotpURI] = useState<string | undefined>(state?.totpURI);
  const [backupCodes, setBackupCodes] = useState<string[] | undefined>(state?.backupCodes);

  useEffect(() => {
    if (state?.totpURI) setTotpURI(state.totpURI);
    if (state?.backupCodes) setBackupCodes(state.backupCodes);
    if (state?.userEnabled) {
      setTotpURI(undefined);
      setBackupCodes(undefined);
    }
    if (state?.intermediateEnable === false) {
      setTotpURI(undefined);
      setBackupCodes(undefined);
    }
  }, [state?.totpURI, state?.backupCodes, state?.userEnabled, state?.intermediateEnable]);

  return (
    <section className="px-6 py-5">
      <SectionHeading
        right={
          state?.intermediateEnable !== undefined ?
            <Badge color={state.intermediateEnable ? "green" : "gray"}>
              {state.intermediateEnable ? "Enabled" : "Disabled"}
            </Badge>
          : undefined
        }
      >
        Two-Factor Authentication
      </SectionHeading>

      {!state?.userEnabled && !state?.intermediateEnable && (
        <>
          <p className="text-sm text-fg-muted mb-4">
            Use an authenticator app (TOTP) or email codes as a second factor. TOTP must be set up
            first before email 2FA can be used.
          </p>
          <Form method="post" className="flex flex-col gap-2 max-w-sm">
            <input type="hidden" name="action" value="2fa_enable" />
            <Input
              type="password"
              name="password"
              id="password_2fa_enable"
              placeholder="Password"
              required
              autoComplete="current-password"
            />
            <Button type="submit">Enable 2FA</Button>
          </Form>
        </>
      )}

      {state?.userEnabled && (
        <p className="text-sm text-success mb-4">Two-factor authentication is active.</p>
      )}
      {state?.intermediateEnable && !state.userEnabled && (
        <p className="text-sm text-warning mb-4">Verify using the QR code to complete setup.</p>
      )}

      {totpURI && (
        <div className="mb-5">
          <p className="text-sm text-fg-muted mb-3">
            Scan this QR code with your authenticator app.
          </p>
          <div className="inline-flex px-8 py-2 w-fit h-full bg-surface-raised mb-4">
            <QRCode className="w-64 h-80" data={totpURI} />
          </div>
          <VerifyTotpForm errors={state?.errors} />
        </div>
      )}

      {backupCodes && backupCodes.length > 0 && <BackupCodesDisplay codes={backupCodes} />}

      {state?.userEnabled && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 pt-5 border-t border-border-muted">
          {!totpURI && (
            <Form method="post" className="flex flex-col gap-2">
              <input type="hidden" name="action" value="get_totp_uri" />
              <p className="text-xs text-fg-muted mb-1">Show QR Code</p>
              <Input
                type="password"
                name="password"
                id="password_get_uri"
                placeholder="Password"
                required
                autoComplete="current-password"
              />
              <Button type="submit">Show QR Code</Button>
            </Form>
          )}

          <Form method="post" className="flex flex-col gap-2">
            <input type="hidden" name="action" value="get_backup_codes" />
            <p className="text-xs text-fg-muted mb-1">Regenerate Codes</p>
            <Input
              type="password"
              name="password"
              id="password_backup"
              placeholder="Password"
              required
              autoComplete="current-password"
            />
            <Button type="submit">New Backup Codes</Button>
          </Form>

          <Form method="post" className="flex flex-col gap-2">
            <input type="hidden" name="action" value="2fa_disable" />
            <p className="text-xs text-fg-muted mb-1">Disable 2FA</p>
            <Input
              type="password"
              name="password"
              id="password_2fa_disable"
              placeholder="Password"
              required
              autoComplete="current-password"
            />
            <Button type="submit">Disable 2FA</Button>
          </Form>
        </div>
      )}
    </section>
  );
}

function VerifyTotpForm({ errors }: { errors?: AuthError[] }) {
  const copy = useCopy();
  return (
    <Form method="post" className="flex flex-col gap-2 max-w-sm">
      <input type="hidden" name="action" value="2fa_totp_verify" />

      <label htmlFor="totp_code" className="text-xs text-fg-muted">
        Verify with a code from your app
      </label>
      {errors?.map((error) => (
        <FormAlert
          key={error.type}
          message={error.type ? copy.error[error.type] : undefined}
          submessage={error.type === "generic_error" ? error.message : ""}
        />
      ))}
      <Input
        type="text"
        name="totp_code"
        id="totp_code"
        placeholder="6-digit code"
        minLength={6}
        maxLength={6}
        required
        autoComplete="one-time-code"
      />
      <Button type="submit">Verify Code</Button>
    </Form>
  );
}

function BackupCodesDisplay({ codes }: { codes: string[] }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-surface-raised p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-fg-faint uppercase tracking-[0.1em]">
          Backup Codes
        </p>
        <Button
          variant="ghost"
          className="px-3"
          onClick={() => {
            navigator.clipboard.writeText(codes.join("\n")).then(() => {
              setCopied(true);
            });
          }}
        >
          {copied ? "Copied" : "Copy All"}
        </Button>
      </div>
      <p className="text-xs text-fg-muted mb-3">Save these somewhere safe. Each code works once.</p>
      <Button variant="ghost" className="w-full mb-2" onClick={() => setOpen(!open)}>
        {open ? "Hide backup codes" : "Show backup codes"}
      </Button>
      {open && (
        <div className="font-mono text-xs grid grid-cols-2 gap-1">
          {codes.map((code, idx) => (
            <span key={idx} className="p-2 bg-surface text-fg text-center">
              {code}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Sessions ─── */

type Session = {
  id: string;
  ipAddress: string;
  lastLoggedIn: Date;
};

function SessionsSection({ sessions, current }: { sessions: Session[]; current: Session }) {
  return (
    <section className="px-6 py-5">
      <SectionHeading>Sessions</SectionHeading>

      {sessions.length > 0 ?
        <>
          <div className="divide-y divide-border-muted">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between py-2.5 first:pt-0 gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm truncate">{session.ipAddress}</p>
                    {session.id === current.id && <Badge color="blue">Current</Badge>}
                  </div>
                  <p className="text-xs text-fg-muted mt-0.5">
                    {new Date(session.lastLoggedIn).toLocaleString()}
                  </p>
                </div>
                <Form method="post">
                  <input type="hidden" name="action" value="revoke_session" />
                  <input type="hidden" name="session" value={session.id} />
                  <Button variant="ghost" type="submit" className="text-xs px-3">
                    Revoke
                  </Button>
                </Form>
              </div>
            ))}
          </div>
          {sessions.length > 1 && (
            <Form method="post" className="mt-3">
              <input type="hidden" name="action" value="revoke_session" />
              <input type="hidden" name="session" value="all" />
              <Button variant="ghost" type="submit">
                Revoke All Other Sessions
              </Button>
            </Form>
          )}
        </>
      : <p className="text-sm text-fg-muted">No active sessions</p>}
    </section>
  );
}
