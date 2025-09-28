import { useState } from "react";
import {
  type AuthState,
  PasswordRegisterForm,
  type PasswordRegisterFormData,
  type AuthError,
} from "./components/password";
import { useNavigate } from "react-router";
import { ParseRegister } from "./lib/parse";
import { authClient } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";

export function meta() {
  return [
    { title: "Sign In " },
    { name: "description", content: "Sign in to your account." },
    {},
  ];
}

export default function () {
  const navigate = useNavigate();
  const { state, errors, onSubmit } = useSignUp();

  return (
    <PasswordRegisterForm
      emailVerificationRequired={false}
      onSkipClick={() => navigate("/")}
      onLoginClick={() => navigate("/auth/login")}
      state={state}
      onSubmit={onSubmit}
      errors={errors}
    />
  );
}

function useSignUp(): {
  state: AuthState;
  errors: AuthError[];
  onSubmit: (data: PasswordRegisterFormData) => void;
} {
  const [state, setState] = useState<AuthState>({ type: "start" });
  const [errors, setErrors] = useState<AuthError[]>([]);
  const signUpMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      username: string;
      name: string;
    }) => {
      return await authClient.signUp.email(data);
    },
    onSuccess: (user) => {
      setState({ type: "code", email: user.data?.user.email });
    },
    onError: (error) => {
      console.error("Sign up failed:", error);
      setErrors([{ type: "validation_error", message: error.message }]);
    },
  });

  function onSubmit(data: PasswordRegisterFormData) {
    if (data.email) {
      setState({ ...state, email: data.email });
    }

    if (state.type === "start") {
      const [p, sanityErrors] = ParseRegister(data);
      if (sanityErrors.length > 0) {
        setErrors(sanityErrors);
        return;
      }
      if (p === null) {
        setErrors([{ type: "validation_error" }]);
        return;
      }

      signUpMutation.mutate({
        email: p.email,
        password: p.password,
        username: p.username,
        name: p.username,
      });
    }
  }
  return { state, errors, onSubmit };
}


type ParsedRegisterFormData = {
  [K in keyof Omit<PasswordRegisterFormData, "code">]-?: NonNullable<PasswordRegisterFormData[K]>;
};


export function ParseRegister(
  data: PasswordRegisterFormData,
): [ParsedRegisterFormData | null, AuthError[]] {
  const errors: AuthError[] = [];
  if (!data.email) {
    errors.push({ type: "email_invalid" });
  }
  if (!data.password) {
    errors.push({ type: "password_invalid" });
  }
  if (!data.username) {
    errors.push({ type: "username_invalid" });
  }

  if (errors.length > 0) {
    return [null, errors];
  }

  // We don't want to show "password invalid and password mismatch at the same time.
  if (!data.repeat || data.password !== data.repeat) {
    errors.push({ type: "password_mismatch" });
  }

  if (errors.length > 0) {
    return [null, errors];
  }

  const parsedData: ParsedRegisterFormData = {
    username: data.username!,
    email: data.email!,
    password: data.password!,
    repeat: data.repeat!,
  };

  return [parsedData, errors];
}
