import { FormAlert } from "./form.js";
import { useCopy } from "../lib/copy.js";
import type { AuthError } from "../errors/auth-error.js";
import { Form } from "react-router";
import { useAuthLinks } from "../hooks/use-redirect.js";
import { QRCode } from "@/components/qr.js";

export type AuthState = {
  email?: string;
  errors?: AuthError[];
};

export type TwoFactorTotpState = {
  verified: boolean;
  backupCodes: string[];
  totpUri: string;
};

export type TwoFactorEmailState = {
  verified: boolean;
};

type LoginFormProps = {
  state?: AuthState;
};

type RegisterFormProps = {
  step: "start" | "verify";
  state?: AuthState;
  two_factor?: { totp: TwoFactorTotpState; email: TwoFactorEmailState };
};

type TwoFactorFormProps = {
  state?: AuthState;
};

export type ForgotPasswordFormProps = {
  state?: AuthState;
  step: "start" | "code" | "update" | "try-again";
};

export function PasswordLoginForm({ state }: LoginFormProps) {
  const copy = useCopy();
  const link = useAuthLinks();
  return (
    <Form data-component="form" method="post">
      {state?.errors?.map((error) => (
        <FormAlert
          key={error.type}
          message={error.type ? copy.error[error.type] : undefined}
          submessage={error.type === "generic_error" ? error.message : ""}
        />
      ))}
      <input
        data-component="input"
        type="text"
        name="email"
        required
        placeholder={copy.input_email_or_username}
        autoFocus={!state?.errors}
      />
      <input
        data-component="input"
        required
        type="password"
        name="password"
        placeholder={copy.input_password}
        autoComplete="current-password"
      />
      <button data-component="button" type="submit">
        {copy.button_continue}
      </button>
      <div data-component="form-footer">
        <span>
          {copy.register_prompt}{" "}
          <button type="button" data-component="link" onClick={link.register}>
            {copy.register}
          </button>
        </span>
        <button type="button" data-component="link" onClick={link.forgot}>
          {copy.change_prompt}
        </button>
      </div>
    </Form>
  );
}

export function PasswordRegisterForm(props: RegisterFormProps) {
  const copy = useCopy();
  console.log(JSON.stringify(props));

  return (
    <Form data-component="form" method="post">
      {props.state?.errors?.map((error) => (
        <FormAlert
          key={error.type}
          message={error.type ? copy.error[error.type] : undefined}
          submessage={error.type === "generic_error" ? error.message : ""}
        />
      ))}
      {props.step === "start" && <PasswordRegisterStartForm {...props} />}
      {props.step === "verify" && (
        <div className="flex flex-row gap-x-8">
          <PasswordRegisterVerifyTotp {...props} />
          <PasswordRegisterVerifyEmail {...props} />
        </div>
      )}
    </Form>
  );
}

function PasswordRegisterVerifyTotp({ state, two_factor }: RegisterFormProps) {
  const copy = useCopy();

  return (
    <div className="flex-1">
      <input type="hidden" name="action" value="verify:totp" />
      <input type="hidden" name="email" value={state?.email} />

      <div className="flex justify-center mb-4">
        <div className="w-48 h-48 bg-white p-2 rounded">
          {two_factor?.totp.totpUri ? <QRCode data={two_factor?.totp.totpUri} /> : null}
        </div>
      </div>

      {two_factor?.totp.verified ? (
        <div className="text-green-600 font-semibold mb-4">TOTP Verified</div>
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

function PasswordRegisterVerifyEmail({ two_factor, state }: RegisterFormProps) {
  const copy = useCopy();

  return (
    <div className="flex-1">
      <input type="hidden" name="action" value="verify:email" />
      <input type="hidden" name="email" value={state?.email} />

      {two_factor?.email.verified ? (
        <div className="text-green-600 font-semibold mb-4">Email Verified</div>
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

function PasswordRegisterStartForm({ state }: RegisterFormProps) {
  const copy = useCopy();
  const link = useAuthLinks();

  return (
    <>
      <input type="hidden" name="action" value="register" />
      <input data-component="input" type="text" name="username" required placeholder={copy.input_username} />
      <input
        data-component="input"
        type="text"
        name="email"
        defaultValue={state?.email}
        required
        placeholder={copy.input_email}
      />
      <input
        data-component="input"
        type="password"
        name="password"
        placeholder={copy.input_password}
        required
        defaultValue={""}
        autoComplete="new-password"
      />
      <input
        data-component="input"
        type="password"
        name="repeat"
        required
        placeholder={copy.input_repeat}
        autoComplete="new-password"
      />
      <button data-component="button" type="submit">
        {copy.button_continue}
      </button>
      <div data-component="form-footer">
        <span>
          {copy.login_prompt}{" "}
          <button type="button" data-component="link" onClick={link.login}>
            {copy.login}
          </button>
        </span>
      </div>
    </>
  );
}

export function PasswordLoginTwoFactorForm({ state }: TwoFactorFormProps) {
  const copy = useCopy();

  return (
    <Form data-component="form" method="post">
      {state?.errors?.map((error) => (
        <FormAlert key={error.type} message={error?.type ? copy.error[error.type] : undefined} />
      ))}
      <input type="hidden" name="action" value="verify" />
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
      <div data-component="form-footer">
        <button type="submit" data-component="link" name="resend" value="true">
          {copy.code_resend}
        </button>
      </div>
    </Form>
  );
}

export function PasswordForgotForm({ state, step }: ForgotPasswordFormProps) {
  const copy = useCopy();
  const link = useAuthLinks();

  return (
    <Form data-component="form" method="post">
      {state?.errors?.map((error) => (
        <FormAlert
          key={error.type}
          message={
            error?.type
              ? error.type === "generic_error"
                ? (error.message ?? copy.error[error.type])
                : copy.error[error.type]
              : undefined
          }
        />
      ))}

      {step === "start" && (
        <>
          <input type="hidden" name="step" value="start" />
          <input data-component="input" autoFocus type="email" name="email" required placeholder={copy.input_email} />
        </>
      )}

      {step === "code" && (
        <>
          <input type="hidden" name="step" value="code" />
          <input type="hidden" name="email" defaultValue={state?.email} />
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
        </>
      )}

      {step === "try-again" && <input type="hidden" name="step" value="try-again" />}

      {step === "update" && (
        <>
          <input type="hidden" name="step" value="update" />
          <input type="hidden" name="email" defaultValue={state?.email} />
          <input
            data-component="input"
            autoFocus
            type="password"
            name="password"
            placeholder={copy.input_password}
            required
            defaultValue={""}
            autoComplete="new-password"
          />
          <input
            data-component="input"
            type="password"
            name="repeat"
            required
            defaultValue={""}
            placeholder={copy.input_repeat}
            autoComplete="new-password"
          />
        </>
      )}

      <button data-component="button" type="submit">
        {copy.button_continue}
      </button>
      <div data-component="form-footer">
        <span>
          {copy.code_return}{" "}
          <button type="button" data-component="link" onClick={link.login}>
            {copy.login.toLowerCase()}
          </button>
        </span>
        {step === "code" && (
          <button type="submit" data-component="link" name="resend" value="true">
            {copy.code_resend}
          </button>
        )}
      </div>
    </Form>
  );
}

export function PasswordSignOut({ state }: { state?: AuthState }) {
  const copy = useCopy();
  const link = useAuthLinks();

  return (
    <Form data-component="form" method="post">
      {state?.errors?.map((error) => (
        <FormAlert
          key={error.type}
          message={
            error?.type
              ? error.type === "generic_error"
                ? (error.message ?? copy.error[error.type])
                : copy.error[error.type]
              : undefined
          }
        />
      ))}
      <button data-component="button" type="submit">
        {copy.button_continue}
      </button>
      <div data-component="form-footer">
        <span>
          {copy.code_return}{" "}
          <button type="button" data-component="link" onClick={link.login}>
            {copy.login.toLowerCase()}
          </button>
        </span>
      </div>
    </Form>
  );
}
