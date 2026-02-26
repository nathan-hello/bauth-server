import { FormAlert } from "./form.js";
import { useCopy } from "@/lib/copy";
import type { AuthError } from "../errors/auth-error.js";
import { Form } from "react-router";
import { useAuthLinks } from "../hooks/use-redirect.js";
import { Input, Button, FormFooter, TextLink } from "./ui.js";

export type AuthState = {
  email?: string;
  code?: string;
  errors?: AuthError[];
};

type LoginFormProps = {
  state?: AuthState;
};

type RegisterFormProps = {
  state?: AuthState;
};

type TwoFactorFormProps = {
  state?: AuthState;
};

export type ForgotPasswordFormProps = {
  state?: AuthState;
  step: "start" | "code" | "update" | "try-again";
};

export function PasswordLoginForm({ state }: LoginFormProps) {
  const copy = useCopy();
  const link = useAuthLinks();
  return (
    <Form className="max-w-full flex flex-col gap-4" method="post">
      {state?.errors?.map((error) => (
        <FormAlert key={error.type} message={error.type ? copy.error[error.type] : undefined} />
      ))}
      <Input
        type="text"
        name="email"
        required
        placeholder={copy.input_email_or_username}
        autoFocus={!state?.errors}
      />
      <Input
        required
        type="password"
        name="password"
        placeholder={copy.input_password}
        autoComplete="current-password"
      />
      <Button type="submit">{copy.button_continue}</Button>
      <FormFooter>
        <span>
          {copy.register_prompt}{" "}
          <TextLink type="button" onClick={link.register}>
            {copy.register}
          </TextLink>
        </span>
        <TextLink type="button" onClick={link.forgot}>
          {copy.change_prompt}
        </TextLink>
      </FormFooter>
    </Form>
  );
}

export function PasswordRegisterForm(props: RegisterFormProps) {
  const copy = useCopy();

  return (
    <div className="max-w-full flex flex-col gap-4 m-0">
      {props.state?.errors?.map((error) => (
        <FormAlert key={error.type} message={error.type ? copy.error[error.type] : undefined} />
      ))}
      <PasswordRegisterStartForm {...props} />
    </div>
  );
}

function PasswordRegisterStartForm({ state }: RegisterFormProps) {
  const copy = useCopy();
  const link = useAuthLinks();

  return (
    <Form method="post" className="flex flex-col gap-y-4">
      <input type="hidden" name="action" value="register" />
      <Input type="text" name="username" required placeholder={copy.input_username} />
      <Input
        type="text"
        name="email"
        defaultValue={state?.email}
        required
        placeholder={copy.input_email}
      />
      <Input
        type="password"
        name="password"
        placeholder={copy.input_password}
        required
        defaultValue={""}
        autoComplete="new-password"
      />
      <Input
        type="password"
        name="repeat"
        required
        defaultValue={""}
        placeholder={copy.input_repeat}
        autoComplete="new-password"
      />
      <Button type="submit">{copy.button_continue}</Button>
      <FormFooter>
        <span>
          {copy.login_prompt}{" "}
          <TextLink type="button" onClick={link.login}>
            {copy.login}
          </TextLink>
        </span>
      </FormFooter>
    </Form>
  );
}

export function PasswordLoginTwoFactorForm({ state }: TwoFactorFormProps) {
  const copy = useCopy();

  return (
    <Form className="max-w-full flex flex-col gap-4 m-0" method="post">
      {state?.errors?.map((error) => (
        <FormAlert key={error.type} message={error?.type ? copy.error[error.type] : undefined} />
      ))}
      <input type="hidden" name="action" value="verify" />
      <Input
        autoFocus
        name="code"
        minLength={6}
        maxLength={6}
        required
        placeholder={copy.input_code}
        autoComplete="one-time-code"
      />
      <Button type="submit">{copy.button_continue}</Button>
      <FormFooter>
        <TextLink type="submit" name="resend" value="true">
          {copy.code_resend}
        </TextLink>
      </FormFooter>
    </Form>
  );
}

export function PasswordForgotForm({ state, step }: ForgotPasswordFormProps) {
  const copy = useCopy();
  const link = useAuthLinks();

  return (
    <Form className="max-w-full flex flex-col gap-4 m-0" method="post">
      {state?.errors?.map((error) => (
        <FormAlert key={error.type} message={error.type ? copy.error[error.type] : undefined} />
      ))}

      {step === "start" && (
        <>
          <input type="hidden" name="step" value="start" />
          <p className="text-fg-primary">{copy.forgot_email_prompt}</p>
          <Input autoFocus type="email" name="email" required placeholder={copy.input_email} />
        </>
      )}

      {step === "code" && (
        <>
          <input type="hidden" name="step" value="code" />
          <p className="text-fg-primary">{copy.forgot_code_prompt}</p>
          <input type="hidden" name="email" defaultValue={state?.email} />
          <Input
            autoFocus
            name="code"
            minLength={6}
            maxLength={6}
            required
            placeholder={copy.input_code}
            autoComplete="one-time-code"
          />
        </>
      )}

      {step === "try-again" && <input type="hidden" name="step" value="try-again" />}

      {step === "update" && (
        <>
          <input type="hidden" name="step" value="update" />
          <input type="hidden" name="email" defaultValue={state?.email} />
          <input type="hidden" name="code" defaultValue={state?.code} />
          <Input
            autoFocus
            type="password"
            name="password"
            placeholder={copy.input_password}
            required
            defaultValue={""}
            autoComplete="new-password"
          />
          <Input
            type="password"
            name="repeat"
            required
            defaultValue={""}
            placeholder={copy.input_repeat}
            autoComplete="new-password"
          />
        </>
      )}

      <Button type="submit">{copy.button_continue}</Button>
      <FormFooter>
        <span>
          {copy.code_return}{" "}
          <TextLink type="button" onClick={link.login}>
            {copy.login.toLowerCase()}
          </TextLink>
        </span>
        {step === "code" && (
          <TextLink type="submit" name="resend" value="true">
            {copy.code_resend}
          </TextLink>
        )}
      </FormFooter>
    </Form>
  );
}

export function PasswordSignOut({ state }: { state?: AuthState }) {
  const copy = useCopy();
  const link = useAuthLinks();

  return (
    <Form className="max-w-full flex flex-col gap-4 m-0" method="post">
      {state?.errors?.map((error) => (
        <FormAlert key={error.type} message={error.type ? copy.error[error.type] : undefined} />
      ))}
      <Button type="submit">{copy.button_continue}</Button>
      <FormFooter>
        <span>
          {copy.code_return}{" "}
          <TextLink type="button" onClick={link.login}>
            {copy.login.toLowerCase()}
          </TextLink>
        </span>
      </FormFooter>
    </Form>
  );
}
