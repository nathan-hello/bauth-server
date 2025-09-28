import { PasswordRegisterForm } from "./components/password";
import { useNavigate } from "react-router";

export function meta() {
  return [
    { title: "Forgot Password" },
    { name: "description", content: "Reset your password." },
    {},
  ];
}

export default function () {
  const navigate = useNavigate();

  return (
    <PasswordRegisterForm
      state={{ type: "start", email: "" }}
      onLoginClick={() => navigate("/auth/signin")}
    />
  );
}
