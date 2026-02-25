import type { AuthError } from "../errors/auth-error";

export const ERROR_COPY: Partial<Record<AuthError["type"], string>> = {
  password_mismatch: "Passwords do not match.",
  totp_uri_not_found: "",
  // TODO(nate): whenever generic_error is true,
  // we are currently sending that error to client.
  // This is good for dev but not prod.
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
  INVALID_CODE: "Two factor code is invalid.",
  INVALID_DISPLAY_USERNAME: "",
  INVALID_TWO_FACTOR_COOKIE: "",
  INVALID_USERNAME_OR_PASSWORD: "",
  OTP_EXPIRED: "",
  OTP_HAS_EXPIRED: "OTP has expired.",
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
  button_verify: "Verify",

  otp_prompt: "Enter the code that was sent to your email.",
  otp_verified: "Email verified.",

  totp_show_qr: "Show QR Code",
  totp_prompt: "Use your preferred 2FA app to save your secret key.",
  totp_verified: "TOTP Verified.",
  totp_manual_secret: "Secret:",
  totp_manual_alg: "Algorithm:",
  totp_manual_period: "Period:",
  totp_manual_period_seconds: "seconds",
  totp_manual_digits: "Digits:",

  // Forgot password flow
  forgot_email_prompt: "Enter your email to reset your password.",
  forgot_code_prompt: "Enter the code sent to your email.",

  // Two-factor verification (login flow)
  twofa_resent_email: "Verification code resent to your email",
  twofa_switch_totp: "Use authenticator app instead",
  twofa_switch_email: "Use email verification instead",

  // Dashboard
  dashboard_title: "Account Settings",
  dashboard_password_changed: "Password changed successfully",

  // Dashboard: Email
  dashboard_email_heading: "Email",
  dashboard_email_verified_badge: "Verified",
  dashboard_email_unverified_badge: "Unverified",
  dashboard_email_change: "Change Email",
  dashboard_email_new_placeholder: "New email address",
  dashboard_email_verification_sent: "Email verification sent.",
  dashboard_email_unverified_prompt: "Email unverified.",
  dashboard_email_resend_verification: "Resend Email Verification",

  // Dashboard: Password
  dashboard_password_heading: "Password",
  dashboard_password_current_label: "Current Password",
  dashboard_password_current_placeholder: "Current password",
  dashboard_password_new_label: "New Password",
  dashboard_password_new_placeholder: "New password",
  dashboard_password_repeat_label: "Repeat New Password",
  dashboard_password_repeat_placeholder: "Repeat new password",
  dashboard_password_change: "Change Password",

  // Dashboard: Two-Factor Authentication
  dashboard_2fa_heading: "Two-Factor Authentication",
  dashboard_2fa_description:
    "Use an authenticator app (TOTP) or email codes as a second factor. TOTP must be set up first before email 2FA can be used.",
  dashboard_2fa_enable: "Enable 2FA",
  dashboard_2fa_enabled_badge: "Enabled",
  dashboard_2fa_disabled_badge: "Disabled",
  dashboard_2fa_setup_prompt: "Verify using the QR code to complete setup.",
  dashboard_2fa_active: "Two-factor authentication is active.",
  dashboard_2fa_success: "Success!",
  dashboard_2fa_show_qr: "Show QR Code",
  dashboard_2fa_new_backup_codes: "New Backup Codes",
  dashboard_2fa_disable: "Disable 2FA",
  dashboard_2fa_optional_verify:
    "2FA is enabled, meaning no further action is necessary. Use the box below to test.",
  dashboard_2fa_verify_prompt: "Verify with a code from your app.",
  dashboard_2fa_code_placeholder: "6-digit code",
  dashboard_2fa_verify_button: "Verify Code",

  // Dashboard: Backup Codes
  dashboard_backup_codes_title: "Backup Codes",
  dashboard_backup_codes_copied: "Copied",
  dashboard_backup_codes_copy_all: "Copy All",
  dashboard_backup_codes_save: "Save these somewhere safe. Each code works once.",
  dashboard_backup_codes_hide: "Hide backup codes",
  dashboard_backup_codes_show: "Show backup codes",

  // Dashboard: Sessions
  dashboard_sessions_heading: "Sessions",
  dashboard_session_current: "Current",
  dashboard_session_revoke: "Revoke",
  dashboard_session_revoke_all: "Revoke All Other Sessions",
  dashboard_sessions_empty: "No active sessions",
};

export function useCopy() {
  return english;
}
