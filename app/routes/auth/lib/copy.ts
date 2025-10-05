import type { AuthError } from "../errors/auth-error";

export const ERROR_COPY: Record<AuthError["type"], string> = {
  code_invalid: "Code is incorrect.",
  password_mismatch: "Passwords do not match.",
  username_invalid: "Username is not valid.",
  generic_error: "Something wrong happened.",
  username_taken: "Username is taken.",
  otp_failed: "Email one-time passcode failed for an unknown reason.",

  // better auth errors
  USERNAME_IS_INVALID: "Username is invalid.",
  USERNAME_IS_TOO_SHORT: "Username is too short.",
  USERNAME_IS_TOO_LONG: "Username is too long.",
  ACCOUNT_NOT_FOUND: "Invalid credentials.",
  CREDENTIAL_ACCOUNT_NOT_FOUND: "Invalid credentials.",
  INVALID_OTP: "Code is incorrect.",
  TOO_MANY_ATTEMPTS: "Too many unsuccessful attempts.",
  EMAIL_CAN_NOT_BE_UPDATED: "Email cannot be updated.",
  EMAIL_NOT_VERIFIED: "Email is not yet verified.",
  FAILED_TO_CREATE_SESSION: "",
  FAILED_TO_CREATE_USER: "",
  FAILED_TO_GET_SESSION: "",
  FAILED_TO_GET_USER_INFO: "",
  FAILED_TO_UNLINK_LAST_ACCOUNT: "",
  FAILED_TO_UPDATE_USER: "",
  ID_TOKEN_NOT_SUPPORTED: "",
  INVALID_EMAIL: "Invalid email.",
  INVALID_EMAIL_OR_PASSWORD: "Invalid credentials.",
  INVALID_PASSWORD: "Password does not meet requirements.",
  INVALID_TOKEN: "",
  PASSWORD_TOO_LONG: "",
  PASSWORD_TOO_SHORT: "",
  PROVIDER_NOT_FOUND: "",
  SESSION_EXPIRED: "",
  SOCIAL_ACCOUNT_ALREADY_LINKED: "",
  USER_ALREADY_EXISTS: "There is already an account with this email.",
  USER_ALREADY_HAS_PASSWORD: "",
  USER_EMAIL_NOT_FOUND: "",
  USER_NOT_FOUND: "User not found.",
};

const META_COPY = {
  auth: { title: "Authenticate" },
  login: { title: "Login" },
  register: { title: "Register" },
  forgot: { title: "Forgot Password" },
  factor: { title: "2fa" },
};

const english = {
  // Error messages
  error: { ...ERROR_COPY },
  meta: { ...META_COPY },
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
  verify_email_prompt: "Enter the code that was sent to your email.",

  // Input placeholders
  input_username: "Username",
  input_email: "Email",
  input_email_or_username: "Email or username",
  input_password: "Password",
  input_code: "Code",
  input_repeat: "Repeat password",
  button_continue: "Continue",
  button_skip: "Skip",
};

export function useCopy() {
  return english;
}
