import React from "react";
import { FormAlert } from "./form.js";
import { useCopy } from "../lib/copy.js";

export type AuthError = {
  type?:
    | "email_taken"
    | "code_invalid"
    | "email_invalid"
    | "password_invalid"
    | "password_mismatch"
    | "validation_error"
    | "username_invalid"
    | "server_error";
  message?: string;
};

export type PasswordLoginFormData = {
  email?: string;
  password?: string;
};

export type PasswordRegisterFormData = {
  username?: string;
  email?: string;
  password?: string;
  repeat?: string;
  code?: string;
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
};

// Default copy text for all components

// Props interfaces for each component
type LoginFormProps = {
  errors?: AuthError[];
  formData?: PasswordLoginFormData;
  onSubmit?: (data: PasswordLoginFormData) => void;
  onRegisterClick?: () => void;
  onForgotPasswordClick?: () => void;
};

interface RegisterFormProps {
  errors?: AuthError[];
  formData?: PasswordRegisterFormData;
  emailVerificationRequired?: boolean;
  state?: AuthState;
  totpUri?: string;
  onSubmit?: (data: PasswordRegisterFormData) => void;
  onLoginClick?: () => void;
  onSkipClick?: () => void;
}

interface TwoFactorFormProps {
  errors?: AuthError[];
  formData?: TwoFactorFormData;
  onSubmit?: (data: TwoFactorFormData) => void;
  onResendCode?: () => void;
}

interface ForgotPasswordFormProps {
  errors?: AuthError[];
  formData?: PasswordForgotFormData;
  state?: AuthState;
  onSubmit?: (data: PasswordForgotFormData) => void;
  onBackToLogin?: () => void;
  onResendCode?: () => void;
}

/**
 * Login Form Component
 * Handles user authentication with email and password
 */
export function PasswordLoginForm({
  errors,
  onSubmit,
  onRegisterClick,
  onForgotPasswordClick,
}: LoginFormProps) {
  const copy = useCopy();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: PasswordLoginFormData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };
    onSubmit?.(data);
  };

  return (
    <form data-component="form" method="post" onSubmit={handleSubmit}>
      {errors?.map((error) => (
        <FormAlert
          key={error.type || "error"}
          message={error?.type ? copy.error[error.type] : undefined}
        />
      ))}
      <input
        data-component="input"
        type="email"
        name="email"
        required
        placeholder={copy.input_email}
        autoFocus={!errors}
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
    </form>
  );
}

/**
 * Register Form Component
 * Handles user registration with email, password, and confirmation
 */
export function PasswordRegisterForm({
  errors,
  onSubmit,
  onLoginClick,
}: RegisterFormProps) {
  const copy = useCopy();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: PasswordRegisterFormData = {
      username: formData.get("username")?.toString(),
      email: formData.get("email")?.toString(),
      password: formData.get("password")?.toString(),
      repeat: formData.get("repeat")?.toString(),
      code: formData.get("code")?.toString(),
    };
    onSubmit?.(data);
  };

  return (
    <form data-component="form" method="post" onSubmit={handleSubmit}>
      {errors?.map((error) => (
        <FormAlert
          message={
            error?.type
              ? error.type === "validation_error"
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
    </form>
  );
}

/**
 * Two Factor Authentication Form Component
 * Handles 2FA code verification
 */
export function PasswordLoginTwoFactorForm({
  errors,
  onSubmit,
  onResendCode,
}: TwoFactorFormProps) {
  const copy = useCopy();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: TwoFactorFormData = {
      code: formData.get("code")?.toString(),
    };
    onSubmit?.(data);
  };

  return (
    <form data-component="form" method="post" onSubmit={handleSubmit}>
      {errors?.map((error) => (
        <FormAlert message={error?.type ? copy.error[error.type] : undefined} />
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
    </form>
  );
}

/**
 * Forgot Password Form Component
 * Handles password reset flow with email and code verification
 */
export function PasswordForgotForm({
  errors,
  state,
  onSubmit,
  onBackToLogin,
  onResendCode,
}: ForgotPasswordFormProps) {
  const copy = useCopy();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: PasswordForgotFormData = {
      email: formData.get("email")?.toString(),
      code: formData.get("code")?.toString(),
      password: formData.get("password")?.toString(),
      repeat: formData.get("repeat")?.toString(),
    };
    onSubmit?.(data);
  };

  return (
    <form data-component="form" method="post" onSubmit={handleSubmit}>
      {errors?.map((error) => (
        <FormAlert
          message={
            error?.type
              ? error.type === "validation_error"
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
          <form method="post">
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
          </form>
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
    </form>
  );
}
