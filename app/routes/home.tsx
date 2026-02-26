import { authClient } from "@/lib/auth";
import { useCopy } from "@/lib/copy";
import { Card, ButtonLink } from "./auth/components/ui";

export default function () {
  const session = authClient.useSession();
  const copy = useCopy();

  return (
    <Card>
      <title>{copy.routes.home.title}</title>
      <div className="flex flex-col gap-2">
        <h1 className="text-lg font-semibold">{copy.routes.home.title}</h1>
        <p className="text-xs text-fg-muted">
          {session.data?.user ?
            `${copy.home_signed_in_as} ${session.data.user.email}`
          : copy.home_not_signed_in}
        </p>
      </div>

      <nav className="flex flex-col gap-2">
        {session.data?.user ?
          <>
            <ButtonLink href="/auth/dashboard">{copy.routes.dashboard.title}</ButtonLink>
            <ButtonLink href="/auth/logout">{copy.routes.logout.title}</ButtonLink>
          </>
        : <>
            <ButtonLink href="/auth/login" variant="primary">
              {copy.routes.login.title}
            </ButtonLink>
            <ButtonLink href="/auth/register">{copy.routes.register.title}</ButtonLink>
            <ButtonLink href="/auth/forgot">{copy.routes.forgot.title}</ButtonLink>
          </>
        }
      </nav>

      <details className="text-xs">
        <summary className="cursor-pointer text-fg-muted">{copy.home_debug}</summary>
        <pre className="select-text mt-2 p-2 bg-surface-raised border border-border overflow-auto max-h-64 text-[10px] leading-relaxed">
          {session.isPending ? copy.home_loading : JSON.stringify(session.data, null, 2)}
        </pre>
      </details>
    </Card>
  );
}
