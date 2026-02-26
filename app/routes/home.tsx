import { authClient } from "@/lib/auth";
import { Card, ButtonLink } from "./auth/components/ui";

export default function () {
  const session = authClient.useSession();

  return (
    <Card>
      <div className="flex flex-col gap-2">
        <h1 className="text-lg font-semibold">Home</h1>
        <p className="text-xs text-fg-muted">
          {session.data?.user ? `Signed in as ${session.data.user.email}` : "Not signed in"}
        </p>
      </div>

      <nav className="flex flex-col gap-2">
        {session.data?.user ?
          <>
            <ButtonLink href="/auth/dashboard">Dashboard</ButtonLink>
            <ButtonLink href="/auth/logout">Logout</ButtonLink>
          </>
        : <>
            <ButtonLink href="/auth/login" variant="primary">
              Login
            </ButtonLink>
            <ButtonLink href="/auth/register">Register</ButtonLink>
            <ButtonLink href="/auth/forgot">Forgot Password</ButtonLink>
          </>
        }
      </nav>

      <details className="text-xs">
        <summary className="cursor-pointer text-fg-muted">Debug</summary>
        <pre className="select-text mt-2 p-2 bg-surface-raised border border-border overflow-auto max-h-64 text-[10px] leading-relaxed">
          {session.isPending ? "Loading..." : JSON.stringify(session.data, null, 2)}
        </pre>
      </details>
    </Card>
  );
}
