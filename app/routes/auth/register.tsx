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
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({ type: "start" });
  const [errors, setErrors] = useState<AuthError[]>([]);
  const [email, setEmail] = useState<string>("");

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
      const sendEmail = await authClient.sendVerificationEmail({
        email: signUp.data.user.email,
      });
      if (sendEmail.error) {
        throw Error(sendEmail.error.code);
      }
      return { email: signUp.data.user.email };
    },
    onSuccess: (user) => {
      setEmail(user.email);
      setState({ type: "code", email: user.email });
    },
    onError: (error) => {
      setErrors([getAuthError(error)]);
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: async (data: { email: string; code: string }) => {
      const verified = await authClient.emailOtp.verifyEmail({
        email: data.email,
        otp: data.code,
      });
      if (verified.error) {
        throw Error(verified.error.code);
      }
      if (verified.data.status === false) {
        throw Error("code_invalid");
      }
      return;
    },
    onSuccess: () => {
      navigate("/");
    },
    onError: (error) => {
      setErrors([getAuthError(error)]);
    },
  });

  function onSubmit(data: PasswordRegisterFormData) {
    setErrors([]);
    if (data.email) {
      setEmail(data.email);
    }

    if (state.type === "start") {
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

    if (state.type === "code") {
      if (!data.code) {
        return;
      }
      verifyEmailMutation.mutate({
        email: data.email || email,
        code: data.code,
      });
    }
  }
  return { state, errors, onSubmit };
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
