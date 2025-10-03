const DEFAULT_COPY = {
  // Error messages
  error: {
    email_taken: "There is already an account with this email.",
    code_invalid: "Code is incorrect.",
    email_invalid: "Email is not valid.",
    password_invalid: "Password is incorrect.",
    password_mismatch: "Passwords do not match.",
    validation_error: "Password does not meet requirements.",
    username_invalid: "Username is not valid",
    server_error: "Something wrong happened"
  },

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
  input_password: "Password",
  input_code: "Code",
  input_repeat: "Repeat password",
  button_continue: "Continue",
  button_skip: "Skip",
};



export function useCopy() {
        return DEFAULT_COPY
}
