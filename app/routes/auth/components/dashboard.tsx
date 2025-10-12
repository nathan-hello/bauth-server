import { FormAlert } from "./form";
import { useCopy } from "../lib/copy";
import type { AuthError } from "../errors/auth-error";
import { Form } from "react-router";
import { QRCode } from "@/components/qr";

export type DashboardState = {
  errors?: AuthError[];
  change_password?: {
    success: boolean;
  };
  totp?: {
    enable?: boolean;
    totpURI?: string;
    backupCodes?: string[];
  };
};

type DashboardProps = {
  state?: DashboardState;
  loaderData: {
    email: {
      email: string;
      verified: boolean;
    };
    sessions: Array<{
      id: string;
      ipAddress: string;
      lastLoggedIn: Date;
    }>;
  };
};

export function Dashboard({ state, loaderData }: DashboardProps) {
  const copy = useCopy();
  
  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Account Dashboard</h1>
      
      {/* Global errors */}
      {state?.errors?.map((error) => (
        <FormAlert
          key={error.type}
          message={error.type ? copy.error[error.type] : undefined}
          submessage={error.type === "generic_error" ? error.message : ""}
        />
      ))}

      {/* Success messages */}
      {state?.change_password?.success && (
        <FormAlert
          color="success"
          message="Password changed successfully"
        />
      )}

      <EmailSection email={loaderData.email} />
      <PasswordSection />
      <TwoFactorSection state={state?.totp} />
      <SessionsSection sessions={loaderData.sessions} />
    </div>
  );
}

type EmailData = {
  email: string;
  verified: boolean;
};

function EmailSection({ email }: { email: EmailData }) {
  return (
    <section className="border rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Email</h2>
      <div className="mb-4">
        <p className="text-sm text-gray-600">Current email: {email.email}</p>
        <p className="text-sm text-gray-600">
          Status: {email.verified ? "Verified" : "Not verified"}
        </p>
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
    <section className="border rounded-lg p-4">
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
};

function TwoFactorSection({ state }: { state?: TotpState }) {
  return (
    <section className="border rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Two-Factor Authentication</h2>
      
      {!state?.enable && <EnableTwoFactorForm />}
      
      {state?.totpURI && (
        <>
          <TotpQRCodeDisplay totpURI={state.totpURI} />
          <VerifyTotpForm />
        </>
      )}
      
      {state?.backupCodes && state.backupCodes.length > 0 && (
        <BackupCodesDisplay codes={state.backupCodes} />
      )}
      
      {state?.enable && !state?.totpURI && <GetTotpUriForm />}
      
      {state?.enable && <RegenerateBackupCodesForm />}
      
      {state?.enable && <DisableTwoFactorForm />}
    </section>
  );
}

function EnableTwoFactorForm() {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Enable 2FA</h3>
      <Form method="post" className="flex flex-col gap-2">
        <input type="hidden" name="action" value="2fa_enable" />
        
        <label htmlFor="password_2fa_enable" className="text-sm font-medium">
          Confirm your password
        </label>
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
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Set up your authenticator</h3>
      <p className="text-sm text-gray-600 mb-4">
        Scan this QR code with your authenticator app
      </p>
      <div className="flex justify-center mb-4">
        <QRCode className="w-[200px] h-[200px]" data={totpURI} />
      </div>
    </div>
  );
}

function VerifyTotpForm() {
  return (
    <Form method="post" className="flex flex-col gap-2 mb-6">
      <input type="hidden" name="action" value="2fa_totp_verify" />
      
      <label htmlFor="totp_code" className="text-sm font-medium">
        Verify with a code from your app
      </label>
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
  return (
    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
      <h3 className="text-lg font-medium mb-2">Backup Codes</h3>
      <p className="text-sm text-gray-600 mb-4">
        Save these codes in a secure place. Each can be used once if you lose access to your authenticator.
      </p>
      <div className="font-mono text-sm grid grid-cols-2 gap-2">
        {codes.map((code, idx) => (
          <div key={idx} className="bg-white p-2 rounded border">
            {code}
          </div>
        ))}
      </div>
    </div>
  );
}

function GetTotpUriForm() {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">Get QR Code</h3>
      <Form method="post" className="flex flex-col gap-2">
        <input type="hidden" name="action" value="get_totp_uri" />
        
        <label htmlFor="password_get_uri" className="text-sm font-medium">
          Enter your password
        </label>
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
      <Form method="post" className="flex flex-col gap-2">
        <input type="hidden" name="action" value="get_backup_codes" />
        
        <label htmlFor="password_backup" className="text-sm font-medium">
          Enter your password
        </label>
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
      <h3 className="text-lg font-medium mb-2">Disable 2FA</h3>
      <Form method="post" className="flex flex-col gap-2">
        <input type="hidden" name="action" value="2fa_disable" />
        
        <label htmlFor="password_2fa_disable" className="text-sm font-medium">
          Enter your password
        </label>
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

function SessionsSection({ sessions }: { sessions: Session[] }) {
  return (
    <section className="border rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Active Sessions</h2>
      
      {sessions.length > 0 ? (
        <>
          <SessionsList sessions={sessions} />
          {sessions.length > 1 && <RevokeAllSessionsForm />}
        </>
      ) : (
        <p className="text-gray-600 mb-4">No active sessions</p>
      )}
    </section>
  );
}

function SessionsList({ sessions }: { sessions: Session[] }) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      {sessions.map((session) => (
        <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <div>
            <p className="font-medium">{session.ipAddress}</p>
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
      <button 
        data-component="button" 
        type="submit"
        className="text-sm"
      >
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
