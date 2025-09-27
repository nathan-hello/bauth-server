import { PasswordLoginForm } from "./components/password";
import { useNavigate, useNavigation } from "react-router";

export function meta() {
  return [
    { title: "Sign In " },
    { name: "description", content: "Sign in to your account." },
    {},
  ];
}

export default function () {
  const navigate = useNavigate();

  return (
    <PasswordLoginForm
      onRegisterClick={() => navigate("/auth/signup")}
      onForgotPasswordClick={() => navigate("/auth/forgot")}
    />
  );
}
