import { Body, Container, Hr, Img, Link, Section, Text } from "@react-email/components";

function Layout({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <Body style={{ fontFamily: "sans-serif", backgroundColor: "#ffffff" }}>
      <br />
      <Container style={{ maxWidth: 480, margin: "0 auto", padding: "20px 0" }}>
        <Section style={{ textAlign: "center" as const }}>
          <Link href={url} style={{ color: "inherit", textDecoration: "none" }}>
            <table cellPadding={0} cellSpacing={0} style={{ margin: "0 auto" }}>
              <tr>
                <td style={{ verticalAlign: "middle" }}>
                  <Img src={`${url}/favicon.png`} width={32} height={32} alt="" />
                </td>
                <td style={{ verticalAlign: "middle", paddingLeft: 8 }}>
                  <Text style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{url}</Text>
                </td>
              </tr>
            </table>
          </Link>
        </Section>
        <br />
        <Hr />
        <br />
        <Section style={{ textAlign: "center" as const, padding: "16px 0" }}>{children}</Section>
        <br />
        <Hr style={{ borderColor: "#e5e5e5" }} />
        <Text
          style={{ color: "#666", fontSize: 13, textAlign: "center" as const, lineHeight: "1.5" }}
        >
          If you did not initiate this request, you can safely ignore this email. If you believe
          your account has been compromised,{" "}
          <Link href={`${url}/auth/forgot`} style={{ color: "#2563eb" }}>
            reset your password
          </Link>{" "}
          or go to your{" "}
          <Link href={`${url}/auth/dashboard`} style={{ color: "#2563eb" }}>
            dashboard
          </Link>{" "}
          to review your account.
        </Text>
      </Container>
    </Body>
  );
}

export function EmailOtp({ email, otp, url }: { email: string; otp: string; url: string }) {
  return (
    <Layout url={url}>
      <Text style={{ fontSize: 15, margin: 0 }}>
        Your one-time login code for <strong>{email}</strong>:
      </Text>
      <Text style={{ fontSize: 32, fontWeight: "bold", letterSpacing: "0.15em", margin: "16px 0" }}>
        {otp}
      </Text>
      <Text style={{ fontSize: 14, color: "#666", margin: 0 }}>
        This code expires in 15 minutes. Do not share it with anyone.
      </Text>
    </Layout>
  );
}

export function Email2fa({ email, otp, url }: { email: string; otp: string; url: string }) {
  return (
    <Layout url={url}>
      <Text style={{ fontSize: 15, margin: 0 }}>
        Your two-factor authentication code for <strong>{email}</strong>:
      </Text>
      <Text style={{ fontSize: 32, fontWeight: "bold", letterSpacing: "0.15em", margin: "16px 0" }}>
        {otp}
      </Text>
      <Text style={{ fontSize: 14, color: "#666", margin: 0 }}>
        This code expires shortly. Do not share it with anyone.
      </Text>
    </Layout>
  );
}

export function EmailVerification({
  verificationLink,
  email,
  url,
}: {
  verificationLink: string;
  email: string;
  url: string;
}) {
  return (
    <Layout url={url}>
      <Text style={{ fontSize: 15, margin: "0 0 16px" }}>
        Click the link below to verify the email address <strong>{email}</strong>:
      </Text>
      <Link href={url + verificationLink} style={{ color: "#2563eb", fontSize: 14 }}>
        {url + verificationLink}
      </Link>
    </Layout>
  );
}
