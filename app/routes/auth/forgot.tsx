import { PasswordForgotForm, PasswordLoginForm } from "./components/password";
import { useNavigate, useNavigation } from "react-router";

export function meta() {
  return [
    { title: "Forgot Password" },
    { name: "description", content: "Reset your password." },
    {},
  ];
}

export default function () {
  const navigate = useNavigate();

  return <PasswordForgotForm 
                state={{type: "start", email: ""}}
                onBackToLogin={() => navigate("/auth/signin")} />;
}
