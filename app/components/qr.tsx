import QR from "qrcode";
import { useState, type HTMLAttributes } from "react";
export type QRCodeProps = HTMLAttributes<HTMLDivElement> & {
  data: string;
  foreground?: string;
  background?: string;
  robustness?: "L" | "M" | "Q" | "H";
};
export const QRCode = async ({ data, foreground = "#111", background = "#eee", robustness = "M", className, ...props }: QRCodeProps) => {
  const [qrSvg, setQrSvg] = useState("");
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
  return (
    <div
      className="size-full [&_svg]:size-full"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: "Required for SVG"
      dangerouslySetInnerHTML={{ __html: qrSvg }}
      {...props}
    />
  );
};
