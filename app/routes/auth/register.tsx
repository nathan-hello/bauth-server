import { useState } from "react";
import {
  type AuthState,
  PasswordRegisterForm,
  type PasswordRegisterFormData,
} from "./components/password";
import { useNavigate } from "react-router";
import { authClient } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";
import { getAuthError, type AuthError } from "./errors/auth-error";

export function meta() {
  return [{ title: "Sign Up" }];
}

export default function () {
  const navigate = useNavigate();
  const { errors, onSubmit } = useSignUp();

  return (
    <PasswordRegisterForm
      onSkipClick={() => navigate("/")}
      onLoginClick={() => navigate("/auth/login")}
      onSubmit={onSubmit}
      errors={errors}
    />
  );
}

function useSignUp(): {
  errors: AuthError[];
  onSubmit: (data: PasswordRegisterFormData) => void;
} {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<AuthError[]>([]);

  const signUpMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      username: string;
      name: string;
    }) => {
      const signUp = await authClient.signUp.email(data);
      if (signUp.error) {
        throw Error(signUp.error.code);
      }
      console.log("sign up success", JSON.stringify(signUp.data.user));
      return { email: signUp.data.user.email };
    },
    onSuccess: () => {
      navigate("/chat");
    },
    onError: (error) => {
      setErrors([getAuthError(error)]);
    },
  });

  function onSubmit(data: PasswordRegisterFormData) {
    setErrors([]);
    const [p, errs] = ParseRegister(data);
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    signUpMutation.mutate({
      email: p!.email,
      password: p!.password,
      username: p!.username,
      name: p!.username,
    });
  }
  return { errors, onSubmit };
}

type ParsedRegisterFormData = {
  [K in keyof Omit<PasswordRegisterFormData, "code">]-?: NonNullable<
    PasswordRegisterFormData[K]
  >;
};

function ParseRegister(
  data: PasswordRegisterFormData,
): [ParsedRegisterFormData | null, AuthError[]] {
  const errors: AuthError[] = [];
  if (!data.email) {
    errors.push({ type: "INVALID_EMAIL" });
  }
  if (!data.password) {
    errors.push({ type: "INVALID_PASSWORD" });
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
