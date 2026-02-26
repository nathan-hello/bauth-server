import { Button, ButtonLink } from "@/routes/auth/components/ui";
import { useCopy } from "@/lib/copy";
import QR from "qrcode";
import { useEffect, useMemo, useState, type HTMLAttributes } from "react";

export type QRCodeProps = HTMLAttributes<HTMLDivElement> & {
  data: string;
};

type Tab = "Link" | "QR" | "Manual";

export function QRCode({ data, ...props }: QRCodeProps) {
  const [qrSvg, setQrSvg] = useState("");
  const [tab, setTab] = useState<Tab>("Link");
  const copy = useCopy();
  const manual = useMemo(() => parseOtpauthUri(data), [data]);

  useEffect(() => {
    QR.toString(
      data,
      {
        type: "svg",
        color: { dark: "#111", light: "#eee" },
        width: 200,
        errorCorrectionLevel: "M",
      },
      (error, svg) => {
        if (error) console.error("QR code could not be rendered", error);
        setQrSvg(svg);
      },
    );
  }, [data]);

  return (
    <div className="flex flex-col text-xl" {...props}>
      <div className="flex border border-border py-1 my-2 gap-x-4">
        {(
          [
            ["Link", copy.totp_tab_link],
            ["QR", copy.totp_tab_qr],
            ["Manual", copy.totp_tab_manual],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 px-3 py-1.5 font-medium cursor-pointer border-0 ${
              tab === key ? "bg-surface-raised text-fg" : "bg-transparent text-fg-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "QR" && (
        <div className="[&_svg]:size-full" dangerouslySetInnerHTML={{ __html: qrSvg }} />
      )}

      {tab === "Manual" && (
        <div className="flex flex-col gap-2 select-text break-all">
          <div>
            <strong>{copy.totp_manual_secret}</strong> <br />{" "}
            <span className="font-mono">{manual.secret}</span>
          </div>
          <div>
            <strong>{copy.totp_manual_alg}</strong> <br />{" "}
            <span className="font-mono">{manual.algorithm}</span>
          </div>
          <div>
            <strong>{copy.totp_manual_period}</strong> <br />{" "}
            <span className="font-mono">
              {manual.period} {copy.totp_manual_period_seconds}
            </span>
          </div>
          <div>
            <strong>{copy.totp_manual_digits}</strong> <br />{" "}
            <span className="font-mono">{manual.digits}</span>
          </div>
        </div>
      )}

      {tab === "Link" && (
        <div className="flex items-center justify-center">
          <ButtonLink href={data} variant="primary" className="mt-8">
            {copy.totp_open_app}
          </ButtonLink>
        </div>
      )}
    </div>
  );
}

export function parseOtpauthUri(uri: string) {
  const u = new URL(uri);

  if (u.protocol !== "otpauth:") {
    throw new Error("Invalid protocol (expected otpauth:)");
  }

  const params: Record<string, string> = {};

  u.searchParams.forEach((v, k) => {
    params[k] = v;
  });
  if (!("secret" in params)) {
    params.secret = "Error: could not parse params from secret.";
  }

  const digits = params.digits ? Number(params.digits) : 6;
  const period = params.period ? Number(params.period) : 30;
  const algorithm = "SHA1";

  return { digits, period, algorithm, secret: params.secret };
}
