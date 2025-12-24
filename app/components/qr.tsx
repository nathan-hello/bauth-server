import { useCopy } from "@/routes/auth/lib/copy";
import QR from "qrcode";
import { useEffect, useMemo, useState, type HTMLAttributes } from "react";

export type QRCodeProps = HTMLAttributes<HTMLDivElement> & {
  data: string;
};

export function QRCode({ data, ...props }: QRCodeProps) {
  const [qrSvg, setQrSvg] = useState("");
  const [mode, setMode] = useState<"blur" | "qr" | "text">("blur");
  const foreground = "#111";
  const background = "#eee";
  const robustness = "M";

  const manual = useMemo(() => parseOtpauthUri(data), [data]);

  useEffect(() => {
    QR.toString(
      data,
      {
        type: "svg",
        color: {
          dark: foreground,
          light: background,
        },
        width: 200,
        errorCorrectionLevel: robustness,
      },
      (error, svg) => {
        if (error) {
          console.error("QR code could not be rendered", error);
        }
        setQrSvg(svg);
      },
    );
  }, []);

  const copy = useCopy();
  return (
    <div className="size-full cursor-pointer" {...props}>
      {mode === "text" ?
        <div className="size-full  flex flex-col justify-around overflow-auto text-xs select-text break-all">
          <strong>Secret:</strong> <span className="font-mono">{manual.secret} </span>
          <strong>Algorithm:</strong> <span className="font-mono">{manual.algorithm}</span>
          <strong>Period:</strong> <span className="font-mono">{manual.period} </span>
          <strong>Digits:</strong> <span className="font-mono">{manual.digits} </span>
          <div data-component="button" className="cursor-pointer" onClick={() => setMode("qr")}>
            {copy.totp_show_qr}
          </div>
        </div>
      : <div
          onClick={() => {
            if (mode === "blur") {
              setMode("qr");
            }
            if (mode === "qr") {
              setMode("text");
            }
          }}
          className={`size-full [&_svg]:size-full ${mode === "blur" ? "blur-md" : ""}`}
          dangerouslySetInnerHTML={{
            __html: qrSvg,
          }}
        />
      }
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

  return {
    digits,
    period,
    algorithm,
    secret: params.secret,
  };
}
