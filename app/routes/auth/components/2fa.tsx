import { FormAlert } from "./form";
import { useCopy } from "../lib/copy";
import type { AuthError } from "../errors/auth-error";
import { Form } from "react-router";
import { useAuthLinks } from "../hooks/use-redirect";

export type TwoFactorState = {
  errors?: AuthError[];
  verificationType?: "totp" | "email";
  resentEmail?: boolean;
};

type TwoFactorProps = {
  state?: TwoFactorState;
};

export function TwoFactorVerification({ state }: TwoFactorProps) {
  const copy = useCopy();
  const verificationType = state?.verificationType || "totp";

  return (
    <div data-component="center">
      <title>{copy.meta.login.title}</title>
      <div data-component="form">
        {state?.errors?.map((error) => (
          <FormAlert
            key={error.type}
            message={error.type ? copy.error[error.type] : undefined}
            submessage={error.type === "generic_error" ? error.message : ""}
          />
        ))}

        {state?.resentEmail && (
          <FormAlert color="success" message="Verification code resent to your email" />
        )}

        {verificationType === "email" && <EmailVerificationForm />}
        {verificationType === "totp" && <TotpVerificationForm />}

        <VerificationTypeSwitcher currentType={verificationType} />
      </div>
    </div>
  );
}

function EmailVerificationForm() {
  const copy = useCopy();
  const link = useAuthLinks();

  return (
    <>
      <Form method="post" className="flex flex-col gap-y-4">
        <input type="hidden" name="action" value="verify-email" />
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
      </Form>

      <div data-component="form-footer">
        <Form method="post">
          <input type="hidden" name="action" value="resend-email" />
          <button type="submit" data-component="link">
            {copy.code_resend}
          </button>
        </Form>
        <button type="button" data-component="link" onClick={link.login}>
          {copy.code_return} {copy.login.toLowerCase()}
        </button>
      </div>
    </>
  );
}

function TotpVerificationForm() {
  const copy = useCopy();
  const link = useAuthLinks();

  return (
    <>
      <Form method="post" className="flex flex-col gap-y-4">
        <input type="hidden" name="action" value="verify-totp" />
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
      </Form>

      <div data-component="form-footer">
        <button type="button" data-component="link" onClick={link.login}>
          {copy.code_return} {copy.login.toLowerCase()}
        </button>
      </div>
    </>
  );
}

function VerificationTypeSwitcher({
  currentType,
}: {
  currentType: TwoFactorState["verificationType"];
}) {
  return (
    <div className="mt-4">
      <Form method="post">
        {currentType === "email" && (
          <>
            <input type="hidden" name="action" value="switch-totp" />
            <button type="submit" data-component="link" className="text-sm">
              Use authenticator app instead
            </button>
          </>
        )}
        {currentType === "totp" && (
          <>
            <input type="hidden" name="action" value="switch-email" />
            <button type="submit" data-component="link" className="text-sm">
              Use email verification instead
            </button>
          </>
        )}
      </Form>
    </div>
  );
}
