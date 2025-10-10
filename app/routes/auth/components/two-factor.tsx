import { Form } from "react-router";
import type { AuthError } from "../errors/auth-error";
import { FormAlert } from "./form";
import { useCopy } from "../lib/copy";
import { QRCode } from "@/components/qr";

export type Register2faState = {
  errors?: AuthError[];
  totpVerified: boolean;
  emailVerified: boolean;
}

export type Register2faProps = {
  totpUri?: string;
  state?: Register2faState
};

export function RegisterTwoFactor({ totpUri, state }: Register2faProps) {
  const copy = useCopy();

  return (
    <Form data-component="form" method="post">
      {state?.errors?.map((error) => (
        <FormAlert key={error.type} message={error?.type ? copy.error[error.type] : undefined} />
      ))}
      <div className="flex flex-row gap-x-8">
        <RegisterTwoFactorTotpForm totpUri={totpUri} isVerified={state?.totpVerified} />
        <RegisterTwoFactorEmailForm isVerified={state?.emailVerified} />
      </div>
    </Form>
  );
}

function RegisterTwoFactorTotpForm({ totpUri, isVerified }: { totpUri: string | undefined; isVerified?: boolean }) {
  const copy = useCopy();
  return (
    <div className="flex-1">
      <input type="hidden" name="action" value="totp" />

      <div className="flex justify-center mb-4">
        <div className="w-48 h-48 bg-white p-2 rounded">{totpUri ? <QRCode data={totpUri} /> : null}</div>
      </div>

      {isVerified ? (
        <div className="text-green-600 font-semibold mb-4">✓ TOTP Verified</div>
      ) : (
        <>
          <input
            data-component="input"
            autoFocus
            name="code"
            minLength={6}
            maxLength={6}
            required
            placeholder={copy.input_code}
            autoComplete="one-time-code"
          />
          <button data-component="button" type="submit">
            {copy.button_continue}
          </button>
        </>
      )}
    </div>
  );
}

function RegisterTwoFactorEmailForm({ isVerified }: { isVerified?: boolean }) {
  const copy = useCopy();
  return (
    <div className="flex-1">
      <input type="hidden" name="action" value="email" />

      {isVerified ? (
        <div className="text-green-600 font-semibold mb-4">✓ Email Verified</div>
      ) : (
        <>
          <input
            data-component="input"
            name="code"
            minLength={6}
            maxLength={6}
            required
            placeholder={copy.input_code}
            autoComplete="one-time-code"
          />
          <button data-component="button" type="submit">
            {copy.button_continue}
          </button>
          <div data-component="form-footer">
            <button type="submit" data-component="link" name="resend" value="true">
              {copy.code_resend}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
