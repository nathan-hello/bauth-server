import { FormAlert } from "./form";
import { useCopy } from "../lib/copy";
import type { AuthError } from "../errors/auth-error";
import { Form } from "react-router";
import { QRCode } from "@/components/qr";
import { useState } from "react";
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
          <p className="uppercase tracking-[0.3em] mb-1">{copy.dashboard_title}</p>
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
            <FormAlert color="success" message={copy.dashboard_password_changed} />
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
  const copy = useCopy();
  return (
    <section className="px-6 py-5">
      <SectionHeading
        right={
          <Badge color={email.verified ? "green" : "yellow"}>
            {email.verified ? copy.dashboard_email_verified_badge : copy.dashboard_email_unverified_badge}
          </Badge>
        }
      >
        {copy.dashboard_email_heading}
      </SectionHeading>

      <p className="text-sm mb-5">{email.email}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Form method="post" className="flex flex-col gap-2">
          <input type="hidden" name="action" value="email_change" />
          <label htmlFor="new_email" className="text-xs text-fg-muted">
            {copy.dashboard_email_change}
          </label>
          <Input
            type="email"
            name="new_email"
            id="new_email"
            placeholder={copy.dashboard_email_new_placeholder}
            required
          />
          <Button type="submit">{copy.dashboard_email_change}</Button>
        </Form>

        {!email.verified && (
          <Form method="post" className="flex flex-col gap-2">
            <input type="hidden" name="action" value="email_resend_verification" />
            <label htmlFor="new_email" className="text-xs text-fg-muted">
              {verificationSent ? copy.dashboard_email_verification_sent : copy.dashboard_email_unverified_prompt}
            </label>
            <Button disabled={verificationSent} type="submit">
              {copy.dashboard_email_resend_verification}
            </Button>
          </Form>
        )}
      </div>
    </section>
  );
}

/* ─── Password ─── */

function PasswordSection() {
  const copy = useCopy();
  return (
    <section className="px-6 py-5">
      <SectionHeading>{copy.dashboard_password_heading}</SectionHeading>
      <Form method="post" className="flex flex-col gap-2 max-w-sm">
        <input type="hidden" name="action" value="change_password" />

        <label htmlFor="current" className="text-xs text-fg-muted">
          {copy.dashboard_password_current_label}
        </label>
        <Input
          type="password"
          name="current"
          id="current"
          placeholder={copy.dashboard_password_current_placeholder}
          required
          autoComplete="current-password"
        />

        <label htmlFor="new_password" className="text-xs text-fg-muted">
          {copy.dashboard_password_new_label}
        </label>
        <Input
          type="password"
          name="new_password"
          id="new_password"
          placeholder={copy.dashboard_password_new_placeholder}
          required
          autoComplete="new-password"
        />

        <label htmlFor="new_password_repeat" className="text-xs text-fg-muted">
          {copy.dashboard_password_repeat_label}
        </label>
        <Input
          type="password"
          name="new_password_repeat"
          id="new_password_repeat"
          placeholder={copy.dashboard_password_repeat_placeholder}
          required
          autoComplete="new-password"
        />

        <Button type="submit">{copy.dashboard_password_change}</Button>
      </Form>
    </section>
  );
}

type TotpState = {
  intermediateEnable?: boolean;
  totpURI?: string;
  backupCodes?: string[];
  userEnabled: boolean;
  verified?: boolean;
  errors?: AuthError[];
};

function TwoFactorSection({ state }: { state?: TotpState }) {
  const copy = useCopy();
  const badge =
    state?.intermediateEnable !== undefined ?
      <Badge color={state.intermediateEnable ? "green" : "gray"}>
        {state.intermediateEnable ? copy.dashboard_2fa_enabled_badge : copy.dashboard_2fa_disabled_badge}
      </Badge>
    : undefined;

  if (state?.userEnabled) {
    return (
      <TwoFactorEnabled
        badge={badge}
        totpURI={state.totpURI}
        backupCodes={state.backupCodes}
        verified={state.verified}
        errors={state.errors}
      />
    );
  }

  if (state?.intermediateEnable) {
    return (
      <TwoFactorSetup
        badge={badge}
        totpURI={state.totpURI}
        backupCodes={state.backupCodes}
        errors={state.errors}
      />
    );
  }

  return <TwoFactorDisabled />;
}

/* ─── 2FA: Disabled ─── */

function TwoFactorDisabled() {
  const copy = useCopy();
  return (
    <section className="px-6 py-5">
      <SectionHeading>{copy.dashboard_2fa_heading}</SectionHeading>
      <p className="text-sm text-fg-muted mb-4">
        {copy.dashboard_2fa_description}
      </p>
      <Form method="post" className="flex flex-col gap-2 max-w-sm">
        <input type="hidden" name="action" value="2fa_enable" />
        <Input
          type="password"
          name="password"
          id="password_2fa_enable"
          placeholder={copy.input_password}
          required
          autoComplete="current-password"
        />
        <Button type="submit">{copy.dashboard_2fa_enable}</Button>
      </Form>
    </section>
  );
}

/* ─── 2FA: Setup in progress ─── */

function TwoFactorSetup({
  badge,
  totpURI,
  backupCodes,
  errors,
}: {
  badge?: React.ReactNode;
  totpURI?: string;
  backupCodes?: string[];
  errors?: AuthError[];
}) {
  const copy = useCopy();
  return (
    <section className="px-6 py-5">
      <SectionHeading right={badge}>{copy.dashboard_2fa_heading}</SectionHeading>
      <p className="text-sm text-warning mb-4">{copy.dashboard_2fa_setup_prompt}</p>

      {totpURI && (
        <div className="mb-5">
          <div className="inline-flex px-8 py-2 w-fit h-full bg-surface-raised mb-4">
            <QRCode className="w-64 h-80" data={totpURI} />
          </div>
          <VerifyTotpForm errors={errors} />
        </div>
      )}

      {backupCodes && backupCodes.length > 0 && <BackupCodesDisplay codes={backupCodes} />}
    </section>
  );
}

/* ─── 2FA: Enabled ─── */

const summaryClass =
  "cursor-pointer list-none text-sm font-medium py-2 px-3 border border-border text-fg [&::-webkit-details-marker]:hidden";

function TwoFactorEnabled({
  badge,
  totpURI,
  backupCodes,
  verified,
  errors,
}: {
  badge?: React.ReactNode;
  totpURI?: string;
  backupCodes?: string[];
  verified?: boolean;
  errors?: AuthError[];
}) {
  const copy = useCopy();
  return (
    <section className="px-6 py-5">
      <SectionHeading right={badge}>{copy.dashboard_2fa_heading}</SectionHeading>
      <p className="text-sm text-success mb-4">{copy.dashboard_2fa_active}</p>

      <div className="flex flex-col gap-2 mt-5 pt-5 border-t border-border-muted max-w-sm">
        {totpURI ?
          <div className="mb-5">
            <div className="inline-flex px-8 py-2 w-fit h-full bg-surface-raised mb-4">
              <QRCode className="w-64 h-80" data={totpURI} />
            </div>
            {verified ?
              <p className="text-sm text-success">{copy.dashboard_2fa_success}</p>
            : <VerifyTotpForm errors={errors} optionalCopy={true} />
            }
          </div>
        : <details name="2fa-action">
            <summary className={summaryClass}>{copy.dashboard_2fa_show_qr}</summary>
            <Form method="post" className="flex flex-col gap-2 pt-2">
              <input type="hidden" name="action" value="get_totp_uri" />
              <Input
                type="password"
                name="password"
                id="password_get_uri"
                placeholder={copy.input_password}
                required
                autoComplete="current-password"
              />
              <Button type="submit">{copy.dashboard_2fa_show_qr}</Button>
            </Form>
          </details>
        }

        {backupCodes && backupCodes.length > 0 ?
          <BackupCodesDisplay codes={backupCodes} />
        : <details name="2fa-action">
            <summary className={summaryClass}>{copy.dashboard_2fa_new_backup_codes}</summary>
            <Form method="post" className="flex flex-col gap-2 pt-2">
              <input type="hidden" name="action" value="get_backup_codes" />
              <Input
                type="password"
                name="password"
                id="password_backup"
                placeholder={copy.input_password}
                required
                autoComplete="current-password"
              />
              <Button type="submit">{copy.dashboard_2fa_new_backup_codes}</Button>
            </Form>
          </details>
        }

        <details name="2fa-action">
          <summary className={summaryClass}>{copy.dashboard_2fa_disable}</summary>
          <Form method="post" className="flex flex-col gap-2 pt-2">
            <input type="hidden" name="action" value="2fa_disable" />
            <Input
              type="password"
              name="password"
              id="password_2fa_disable"
              placeholder={copy.input_password}
              required
              autoComplete="current-password"
            />
            <Button type="submit">{copy.dashboard_2fa_disable}</Button>
          </Form>
        </details>
      </div>
    </section>
  );
}

function VerifyTotpForm({
  errors,
  optionalCopy,
}: {
  errors?: AuthError[];
  optionalCopy?: boolean;
}) {
  const copy = useCopy();
  return (
    <Form method="post" className="flex flex-col gap-2 max-w-sm">
      <input type="hidden" name="action" value="2fa_totp_verify" />

      <label htmlFor="totp_code" className="text-xs text-fg-muted">
        {optionalCopy ?
          copy.dashboard_2fa_optional_verify
        : copy.dashboard_2fa_verify_prompt}
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
        placeholder={copy.dashboard_2fa_code_placeholder}
        minLength={6}
        maxLength={6}
        required
        autoComplete="one-time-code"
      />
      <Button type="submit">{copy.dashboard_2fa_verify_button}</Button>
    </Form>
  );
}

function BackupCodesDisplay({ codes }: { codes: string[] }) {
  const copy = useCopy();
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-surface-raised p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-fg-faint uppercase tracking-[0.1em]">
          {copy.dashboard_backup_codes_title}
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
          {copied ? copy.dashboard_backup_codes_copied : copy.dashboard_backup_codes_copy_all}
        </Button>
      </div>
      <p className="text-xs text-fg-muted mb-3">{copy.dashboard_backup_codes_save}</p>
      <Button variant="ghost" className="w-full mb-2" onClick={() => setOpen(!open)}>
        {open ? copy.dashboard_backup_codes_hide : copy.dashboard_backup_codes_show}
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
  const copy = useCopy();
  return (
    <section className="px-6 py-5">
      <SectionHeading>{copy.dashboard_sessions_heading}</SectionHeading>

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
                    {session.id === current.id && <Badge color="blue">{copy.dashboard_session_current}</Badge>}
                  </div>
                  <p className="text-xs text-fg-muted mt-0.5">
                    {new Date(session.lastLoggedIn).toLocaleString()}
                  </p>
                </div>
                <Form method="post">
                  <input type="hidden" name="action" value="revoke_session" />
                  <input type="hidden" name="session" value={session.id} />
                  <Button variant="ghost" type="submit" className="text-xs px-3">
                    {copy.dashboard_session_revoke}
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
                {copy.dashboard_session_revoke_all}
              </Button>
            </Form>
          )}
        </>
      : <p className="text-sm text-fg-muted">{copy.dashboard_sessions_empty}</p>}
    </section>
  );
}
