import { FormAlert } from "./form.js";
import { useCopy } from "../lib/copy.js";
import type { AuthError } from "../errors/auth-error.js";
import { Form } from "react-router";
import { useAuthLinks } from "../hooks/use-redirect.js";

export type AuthState = {
  email?: string;
  errors?: AuthError[];
};

type LoginFormProps = {
  state?: AuthState;
};

type RegisterFormProps = {
  state?: AuthState;
};

type TwoFactorFormProps = {
  state?: AuthState;
};

type ForgotPasswordFormProps = {
  state?: AuthState;
  step: "start" | "code" | "update";
};

/**
 * Login Form Component
 * Handles user authentication with email and password
 */
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

/**
 * Register Form Component
 * Handles user registration with email, password, and confirmation
 */
export function PasswordRegisterForm({ state }: RegisterFormProps) {
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

      <input type="hidden" name="action" value="register" />
      <input data-component="input" type="text" name="username" required placeholder={copy.input_username} />
      <input
        data-component="input"
        type="text"
        name="email"
        defaultValue={state?.email}
        required
        placeholder={copy.input_email_or_username}
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
    </Form>
  );
}

/**
 * Two Factor Authentication Form Component
 * Handles 2FA code verification
 */
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

/**
 * Forgot Password Form Component
 * Handles password reset flow with email and code verification
 */
export function PasswordForgotForm({ state, step }: ForgotPasswordFormProps) {
  const copy = useCopy();
  const link = useAuthLinks();

  return (
    <Form data-component="form" action="#">
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
          <Form>
            <input type="hidden" name="action" value="code" />
            <input type="hidden" name="email" defaultValue={state?.email} />
            <div data-component="form-footer">
              <span>
                {copy.code_return}{" "}
                <button type="button" data-component="link" onClick={link.login}>
                  {copy.login.toLowerCase()}
                </button>
              </span>
              <button type="submit" data-component="link" name="resend" value="true">
                {copy.code_resend}
              </button>
            </div>
          </Form>
        </>
      )}

      {step === "update" && (
        <>
          <input type="hidden" name="step" value="update" />
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
    </Form>
  );
}
