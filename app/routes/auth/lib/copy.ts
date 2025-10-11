import type { AuthError } from "../errors/auth-error";

export const ERROR_COPY: Record<AuthError["type"], string> = {
  password_mismatch: "Passwords do not match.",
  totp_uri_not_found: "",
  generic_error: "Something wrong happened.",

  // better auth errors
  INVALID_USERNAME: "Username is invalid.",
  USERNAME_IS_TOO_SHORT: "Username is too short.",
  USERNAME_TOO_SHORT: "Username is too short.",
  USERNAME_IS_TOO_LONG: "Username is too long.",
  USERNAME_TOO_LONG: "Username is too long.",
  ACCOUNT_NOT_FOUND: "Invalid credentials.",
  CREDENTIAL_ACCOUNT_NOT_FOUND: "Invalid credentials.",
  INVALID_OTP: "Code is incorrect.",
USERNAME_IS_ALREADY_TAKEN_PLEASE_TRY_ANOTHER: "Username taken.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Email taken.",
  INVALID_OTP_CODE: "Code must be 6 digits.",
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
  USERNAME_IS_ALREADY_TAKEN: "Username is taken.",
  UNABLE_TO_CREATE_SESSION: "",
  AUTHENTICATION_FAILED: "",
  BACKUP_CODES_NOT_ENABLED: "",
  CHALLENGE_NOT_FOUND: "",
  FAILED_TO_UPDATE_PASSKEY: "",
  FAILED_TO_VERIFY_REGISTRATION: "",
  INVALID_BACKUP_CODE: "",
  INVALID_CODE: "",
  INVALID_DISPLAY_USERNAME: "",
  INVALID_TWO_FACTOR_COOKIE: "",
  INVALID_USERNAME_OR_PASSWORD: "",
  OTP_EXPIRED: "",
  OTP_HAS_EXPIRED: "",
  OTP_NOT_ENABLED: "",
  PASSKEY_NOT_FOUND: "",
  TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE: "",
  TOTP_NOT_ENABLED: "",
  TWO_FACTOR_NOT_ENABLED: "",
  UNEXPECTED_ERROR: "",
  YOU_ARE_NOT_ALLOWED_TO_REGISTER_THIS_PASSKEY: "",
};

const META_COPY = {
  auth: { title: "Authenticate" },
  login: { title: "Login" },
  register: { title: "Register" },
  forgot: { title: "Forgot Password" },
  factor: { title: "2fa" },
  register_2fa: { title: "Register" },
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
