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
  two_factor?: {
    totp: Partial<TwoFactorTotpState>;
    email: Partial<TwoFactorEmailState>;
  };
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

  return (
    <div data-component="form">
      {props.state?.errors?.map((error) => (
        <FormAlert
          key={error.type}
          message={error.type ? copy.error[error.type] : undefined}
          submessage={error.type === "generic_error" ? error.message : ""}
        />
      ))}
      {props.step === "start" && <PasswordRegisterStartForm {...props} />}
      {props.step === "verify" && (
        <>
          <input type="hidden" name="action" value="verify" />
          <div className="flex flex-col gap-y-4 w-full">
            <div className="flex flex-row gap-x-8 w-full">
              <PasswordRegisterVerifyTotp {...props} />
              <div className="bg-gray-500 h-[80%] my-auto w-[0.1rem]" />
              <PasswordRegisterVerifyEmail {...props} />
            </div>
            <button data-component="button" data-color="ghost">
              {copy.button_skip}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function PasswordRegisterStartForm({ state }: RegisterFormProps) {
  const copy = useCopy();
  const link = useAuthLinks();

  return (
    <Form method="post" className="flex flex-col gap-y-4">
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
        defaultValue={""}
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
    </Form>
  );
}

function PasswordRegisterVerifyTotp({ state, two_factor }: RegisterFormProps) {
  const copy = useCopy();

  console.log("totpuri");
  console.log(two_factor?.totp.totpUri);

  return (
    <div className="w-64 flex flex-col gap-y-8 justify-around">
      <div className="text-center">{two_factor?.totp.verified ? copy.totp_verified : copy.totp_prompt}</div>
      <div className="flex justify-center">
        {two_factor?.totp.totpUri ? <QRCode className="w-[200px] h-[200px]" data={two_factor?.totp.totpUri} /> : null}
      </div>

      <Form method="post" className="flex flex-col gap-y-2">
        <input type="hidden" name="action" value="verify" />
        <input type="hidden" name="email" value={state?.email} />
        <input
          data-component="input"
          autoFocus
          name="code_totp"
          minLength={6}
          maxLength={6}
          placeholder={copy.input_code}
          autoComplete="one-time-code"
        />
        <button data-component="button" type="submit">
          {copy.button_verify}
        </button>
      </Form>
    </div>
  );
}

function PasswordRegisterVerifyEmail({ two_factor, state }: RegisterFormProps) {
  const copy = useCopy();

  return (
    <div className="w-64 flex flex-col gap-y-8 justify-around">
      <div className="text-center">{two_factor?.email.verified ? copy.otp_verified : copy.otp_prompt}</div>
      <Form method="post">
        <input type="hidden" name="email" value={state?.email} />
        <input type="hidden" name="action" value="verify" />
        <input type="hidden" name="resend_email" value="true" />
        <div className="w-[200px] h-[200px] flex items-center justify-center mx-auto">
          <button data-component="button" className="px-4 py-2" type="submit">
            Resend email
          </button>
        </div>
      </Form>

      <Form method="post" className="flex flex-col gap-y-2">
        <input type="hidden" name="email" value={state?.email} />
        <input type="hidden" name="action" value="verify" />
        <input
          data-component="input"
          autoFocus
          name="code_email"
          minLength={6}
          maxLength={6}
          placeholder={copy.input_code}
          autoComplete="one-time-code"
        />
        <button data-component="button" type="submit">
          {copy.button_verify}
        </button>
      </Form>
    </div>
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
