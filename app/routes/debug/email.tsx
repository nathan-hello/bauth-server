import { Email2fa, EmailOtp, EmailVerification } from "@/components/email";

export default function () {
  return (
    <div className="flex flex-col gap-y-12">
      <EmailVerification
        email={"user@gmail.com"}
        url={"https://reluekiss.com"}
        verificationLink="/verify?buiowrbuirgh9q234h89-unerv"
      />
      <EmailOtp email={"user@gmail.com"} otp="123456" url="https://reluekiss.com" />
      <Email2fa email={"user@gmail.com"} otp="123523" url="https://reluekiss.com" />
    </div>
  );
}
