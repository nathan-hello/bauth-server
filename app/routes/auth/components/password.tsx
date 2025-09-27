import React from "react";
import { Layout } from "./base.js";
import { FormAlert } from "./form.js";

// Types for the authentication components
interface AuthError {
  type?: string;
  message?: string;
}

interface AuthFormData {
  email?: string;
  password?: string;
  repeat?: string;
  code?: string;
}

interface AuthState {
  type: "start" | "code" | "update";
  email?: string;
}

// Default copy text for all components
const DEFAULT_COPY = {
  // Error messages
  error_email_taken: "There is already an account with this email.",
  error_invalid_code: "Code is incorrect.",
  error_invalid_email: "Email is not valid.",
  error_invalid_password: "Password is incorrect.",
  error_password_mismatch: "Passwords do not match.",
  error_validation_error: "Password does not meet requirements.",
  
  // Page titles and descriptions
  register_title: "Welcome to the app",
  register_description: "Sign in with your email",
  login_title: "Welcome to the app", 
  login_description: "Sign in with your email",
  
  // Button and link text
  register: "Register",
  register_prompt: "Don't have an account?",
  login_prompt: "Already have an account?",
  login: "Login",
  change_prompt: "Forgot password?",
  code_resend: "Resend code",
  code_return: "Back to",
  logo: "A",
  
  // Input placeholders
  input_email: "Email",
  input_password: "Password",
  input_code: "Code",
  input_repeat: "Repeat password",
  button_continue: "Continue",
};

type AuthCopy = typeof DEFAULT_COPY;

// Props interfaces for each component
interface LoginFormProps {
  error?: AuthError;
  formData?: AuthFormData;
  copy?: Partial<AuthCopy>;
  onSubmit?: (data: AuthFormData) => void;
  onRegisterClick?: () => void;
  onForgotPasswordClick?: () => void;
}

interface RegisterFormProps {
  error?: AuthError;
  formData?: AuthFormData;
  state?: AuthState;
  copy?: Partial<AuthCopy>;
  onSubmit?: (data: AuthFormData) => void;
  onLoginClick?: () => void;
}

interface TwoFactorFormProps {
  error?: AuthError;
  formData?: AuthFormData;
  copy?: Partial<AuthCopy>;
  onSubmit?: (data: AuthFormData) => void;
  onResendCode?: () => void;
}

interface ForgotPasswordFormProps {
  error?: AuthError;
  formData?: AuthFormData;
  state?: AuthState;
  copy?: Partial<AuthCopy>;
  onSubmit?: (data: AuthFormData) => void;
  onBackToLogin?: () => void;
  onResendCode?: () => void;
}

/**
 * Login Form Component
 * Handles user authentication with email and password
 */
export function LoginForm({
  error,
  formData,
  copy: customCopy,
  onSubmit,
  onRegisterClick,
  onForgotPasswordClick,
}: LoginFormProps) {
  const copy = { ...DEFAULT_COPY, ...customCopy };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: AuthFormData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };
    onSubmit?.(data);
  };

  return (
    <Layout>
      <form data-component="form" method="post" onSubmit={handleSubmit}>
        <FormAlert 
          message={error?.type ? copy[`error_${error.type}` as keyof AuthCopy] : undefined} 
        />
        <input
          data-component="input"
          type="email"
          name="email"
          required
          placeholder={copy.input_email}
          autoFocus={!error}
          defaultValue={formData?.email || ""}
        />
        <input
          data-component="input"
          autoFocus={error?.type === "invalid_password"}
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
            <button 
              type="button" 
              data-component="link" 
              onClick={onRegisterClick}
            >
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
    </Layout>
  );
}

/**
 * Register Form Component
 * Handles user registration with email, password, and confirmation
 */
export function RegisterForm({
  error,
  formData,
  state,
  copy: customCopy,
  onSubmit,
  onLoginClick,
}: RegisterFormProps) {
  const copy = { ...DEFAULT_COPY, ...customCopy };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: AuthFormData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      repeat: formData.get("repeat") as string,
      code: formData.get("code") as string,
    };
    onSubmit?.(data);
  };

  const emailError = ["invalid_email", "email_taken"].includes(error?.type || "");
  const passwordError = ["invalid_password", "password_mismatch", "validation_error"].includes(error?.type || "");

  return (
    <Layout>
      <form data-component="form" method="post" onSubmit={handleSubmit}>
        <FormAlert
          message={
            error?.type
              ? error.type === "validation_error"
                ? (error.message ?? copy[`error_${error.type}` as keyof AuthCopy])
                : copy[`error_${error.type}` as keyof AuthCopy]
              : undefined
          }
        />
        
        {state?.type === "start" && (
          <>
            <input type="hidden" name="action" value="register" />
            <input
              data-component="input"
              autoFocus={!error || emailError}
              type="email"
              name="email"
              defaultValue={!emailError ? formData?.email || "" : ""}
              required
              placeholder={copy.input_email}
            />
            <input
              data-component="input"
              autoFocus={passwordError}
              type="password"
              name="password"
              placeholder={copy.input_password}
              required
              defaultValue={!passwordError ? formData?.password || "" : ""}
              autoComplete="new-password"
            />
            <input
              data-component="input"
              type="password"
              name="repeat"
              required
              autoFocus={passwordError}
              placeholder={copy.input_repeat}
              autoComplete="new-password"
            />
            <button data-component="button" type="submit">
              {copy.button_continue}
            </button>
            <div data-component="form-footer">
              <span>
                {copy.login_prompt}{" "}
                <button 
                  type="button" 
                  data-component="link" 
                  onClick={onLoginClick}
                >
                  {copy.login}
                </button>
              </span>
            </div>
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
            <button data-component="button" type="submit">
              {copy.button_continue}
            </button>
          </>
        )}
      </form>
    </Layout>
  );
}

/**
 * Two Factor Authentication Form Component
 * Handles 2FA code verification
 */
export function TwoFactorForm({
  error,
  formData,
  copy: customCopy,
  onSubmit,
  onResendCode,
}: TwoFactorFormProps) {
  const copy = { ...DEFAULT_COPY, ...customCopy };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: AuthFormData = {
      code: formData.get("code") as string,
    };
    onSubmit?.(data);
  };

  return (
    <Layout>
      <form data-component="form" method="post" onSubmit={handleSubmit}>
        <FormAlert 
          message={error?.type ? copy[`error_${error.type}` as keyof AuthCopy] : undefined} 
        />
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
          <button 
            type="button" 
            data-component="link" 
            onClick={onResendCode}
          >
            {copy.code_resend}
          </button>
        </div>
      </form>
    </Layout>
  );
}

/**
 * Forgot Password Form Component
 * Handles password reset flow with email and code verification
 */
export function ForgotPasswordForm({
  error,
  formData,
  state,
  copy: customCopy,
  onSubmit,
  onBackToLogin,
  onResendCode,
}: ForgotPasswordFormProps) {
  const copy = { ...DEFAULT_COPY, ...customCopy };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: AuthFormData = {
      email: formData.get("email") as string,
      code: formData.get("code") as string,
      password: formData.get("password") as string,
      repeat: formData.get("repeat") as string,
    };
    onSubmit?.(data);
  };

  const passwordError = ["invalid_password", "password_mismatch", "validation_error"].includes(error?.type || "");

  return (
    <Layout>
      <form data-component="form" method="post" onSubmit={handleSubmit}>
        <FormAlert
          message={
            error?.type
              ? error.type === "validation_error"
                ? (error.message ?? copy[`error_${error.type}` as keyof AuthCopy])
                : copy[`error_${error.type}` as keyof AuthCopy]
              : undefined
          }
        />
        
        {state?.type === "start" && (
          <>
            <input type="hidden" name="action" value="code" />
            <input
              data-component="input"
              autoFocus
              type="email"
              name="email"
              required
              defaultValue={formData?.email || ""}
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
              defaultValue={!passwordError ? formData?.password || "" : ""}
              autoComplete="new-password"
            />
            <input
              data-component="input"
              type="password"
              name="repeat"
              required
              defaultValue={!passwordError ? formData?.password || "" : ""}
              placeholder={copy.input_repeat}
              autoComplete="new-password"
            />
          </>
        )}
        
        <button data-component="button" type="submit">
          {copy.button_continue}
        </button>
      </form>
      
      {state?.type === "code" && (
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
      )}
    </Layout>
  );
}

// Export the copy object for external use
export { DEFAULT_COPY as AuthCopy };
export type { AuthError, AuthFormData, AuthState };