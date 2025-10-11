import QR from "qrcode";
import { useEffect, useState, type HTMLAttributes } from "react";
export type QRCodeProps = HTMLAttributes<HTMLDivElement> & {
  data: string;
};

export function QRCode({ data, ...props }: QRCodeProps) {
  const [qrSvg, setQrSvg] = useState("");
  const foreground = "#111";
  const background = "#eee";
  const robustness = "M";
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
  });

  return (
    <div
      className="size-full [&_svg]:size-full"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: "Required for SVG"
      dangerouslySetInnerHTML={{ __html: qrSvg }}
      {...props}
    />
  );
}
