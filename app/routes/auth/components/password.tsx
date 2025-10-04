import { FormAlert } from "./form.js";
import { useCopy } from "../lib/copy.js";
import type { AuthError } from "../errors/auth-error.js";
import { Form } from "react-router";

export type PasswordLoginFormData = {
  email?: string;
  password?: string;
};

export type PasswordRegisterFormData = {
  username?: string;
  email?: string;
  password?: string;
  repeat?: string;
};

export type TwoFactorFormData = {
  code?: string;
};

export type PasswordForgotFormData = {
  email?: string;
  password?: string;
  repeat?: string;
  code?: string;
};

export type AuthState = {
  type: "start" | "code" | "update";
  email?: string;
  errors?: AuthError[];
};

// Default copy text for all components

// Props interfaces for each component
type LoginFormProps = {
  state?: AuthState;
  onRegisterClick?: () => void;
  onForgotPasswordClick?: () => void;
};

interface RegisterFormProps {
  state?: AuthState;
  onLoginClick?: () => void;
  onSkipClick?: () => void;
}

interface TwoFactorFormProps {
  state?: AuthState;
  onResendCode?: () => void;
}

interface ForgotPasswordFormProps {
  state?: AuthState;
  onBackToLogin?: () => void;
  onResendCode?: () => void;
}

/**
 * Login Form Component
 * Handles user authentication with email and password
 */
export function PasswordLoginForm({
  state,
  onRegisterClick,
  onForgotPasswordClick,
}: LoginFormProps) {
  const copy = useCopy();

  return (
    <Form data-component="form" method="post" >
      {state?.errors?.map((error) => (
        <FormAlert
          key={error.type}
          message={error?.type ? copy.error[error.type] : undefined}
        />
      ))}
      <input
        data-component="input"
        type="email"
        name="email"
        required
        placeholder={copy.input_email}
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
          <button type="button" data-component="link" onClick={onRegisterClick}>
            {copy.register}
          </button>
        </span>
        <button
          type="button"
          data-component="link"
          onClick={onForgotPasswordClick}
        >
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
export function PasswordRegisterForm({
  state,
  onLoginClick,
}: RegisterFormProps) {
  const copy = useCopy();

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
      <input
        data-component="input"
        type="text"
        name="username"
        required
        placeholder={copy.input_username}
      />
      <input
        data-component="input"
        type="email"
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
          <button type="button" data-component="link" onClick={onLoginClick}>
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
export function PasswordLoginTwoFactorForm({
        state,
  onResendCode,
}: TwoFactorFormProps) {
  const copy = useCopy();

  return (
    <Form data-component="form" method="post">
      {state?.errors?.map((error) => (
        <FormAlert
          key={error.type}
          message={error?.type ? copy.error[error.type] : undefined}
        />
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
        <button type="button" data-component="link" onClick={onResendCode}>
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
export function PasswordForgotForm({
  state,
  onBackToLogin,
  onResendCode,
}: ForgotPasswordFormProps) {
  const copy = useCopy();

  return (
    <Form data-component="form" action="#" >
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

      {state?.type === "start" && (
        <>
          <input type="hidden" name="action" value="code" />
          <input
            data-component="input"
            autoFocus
            type="email"
            name="email"
            required
            placeholder={copy.input_email}
          />
        </>
      )}

      {state?.type === "code" && (
        <>
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
          <Form>
            <input type="hidden" name="action" value="code" />
            <input type="hidden" name="email" value={state.email || ""} />
            <div data-component="form-footer">
              <span>
                {copy.code_return}{" "}
                <button
                  type="button"
                  data-component="link"
                  onClick={onBackToLogin}
                >
                  {copy.login.toLowerCase()}
                </button>
              </span>
              <button
                type="button"
                data-component="link"
                onClick={onResendCode}
              >
                {copy.code_resend}
              </button>
            </div>
          </Form>
        </>
      )}

      {state?.type === "update" && (
        <>
          <input type="hidden" name="action" value="update" />
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
