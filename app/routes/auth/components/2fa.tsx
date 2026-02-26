import { FormAlert } from "./form";
import { useCopy } from "@/lib/copy";
import type { AuthError } from "../errors/auth-error";
import { Form } from "react-router";
import { useAuthLinks } from "../hooks/use-redirect";
import { Input, Button, Card, FormFooter, TextLink } from "./ui";

export type TwoFactorState = {
  errors?: AuthError[];
  verificationType?: "totp" | "email";
  resentEmail?: boolean;
};

type TwoFactorProps = {
  state?: TwoFactorState;
};

export function TwoFactorVerification({ state }: TwoFactorProps) {
  const copy = useCopy();
  const verificationType = state?.verificationType || "totp";

  return (
    <Card>
      <title>{copy.routes["2fa"].title}</title>
      <div className="max-w-full flex flex-col gap-4 m-0">
        {state?.errors?.map((error) => (
          <FormAlert key={error.type} message={error.type ? copy.error[error.type] : undefined} />
        ))}

        {state?.resentEmail && <FormAlert color="success" message={copy.twofa_resent_email} />}

        {verificationType === "email" && <EmailVerificationForm />}
        {verificationType === "totp" && <TotpVerificationForm />}

        <VerificationTypeSwitcher currentType={verificationType} />
      </div>
    </Card>
  );
}

function EmailVerificationForm() {
  const copy = useCopy();
  const link = useAuthLinks();

  return (
    <>
      <Form method="post" className="flex flex-col gap-y-4">
        <input type="hidden" name="action" value="verify-email" />
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
      </Form>

      <FormFooter>
        <Form method="post">
          <input type="hidden" name="action" value="resend-email" />
          <TextLink type="submit">{copy.code_resend}</TextLink>
        </Form>
        <TextLink type="button" onClick={link.login}>
          {copy.code_return} {copy.login.toLowerCase()}
        </TextLink>
      </FormFooter>
    </>
  );
}

function TotpVerificationForm() {
  const copy = useCopy();
  const link = useAuthLinks();

  return (
    <>
      <Form method="post" className="flex flex-col gap-y-4">
        <input type="hidden" name="action" value="verify-totp" />
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
      </Form>

      <FormFooter>
        <TextLink type="button" onClick={link.login}>
          {copy.code_return} {copy.login.toLowerCase()}
        </TextLink>
      </FormFooter>
    </>
  );
}

function VerificationTypeSwitcher({
  currentType,
}: {
  currentType: TwoFactorState["verificationType"];
}) {
  const copy = useCopy();
  return (
    <div className="mt-4">
      <Form method="post">
        {currentType === "email" && (
          <>
            <input type="hidden" name="action" value="switch-totp" />
            <TextLink type="submit" className="text-sm">
              {copy.twofa_switch_totp}
            </TextLink>
          </>
        )}
        {currentType === "totp" && (
          <>
            <input type="hidden" name="action" value="switch-email" />
            <TextLink type="submit" className="text-sm">
              {copy.twofa_switch_email}
            </TextLink>
          </>
        )}
      </Form>
    </div>
  );
}
