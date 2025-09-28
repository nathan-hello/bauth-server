import { PasswordLoginForm, type AuthFormData } from "./components/password";
import { useNavigate } from "react-router";

export function meta() {
  return [
    { title: "Sign In " },
    { name: "description", content: "Sign in to your account." },
    {},
  ];
}

export default function () {
  const navigate = useNavigate();

  function onSubmit(data: AuthFormData) {
  }

  return (
    <PasswordLoginForm
      onRegisterClick={() => navigate("/auth/signup")}
      onForgotPasswordClick={() => navigate("/auth/forgot")}
    />
  );
}
