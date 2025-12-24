import { useNavigate } from "react-router";

export function useAuthLinks() {
  const navigate = useNavigate();
  return {
    register: () => navigate("/auth/register"),
    forgot: () => navigate("/auth/forgot"),
    login: () => navigate("/auth/login"),
  };
}
