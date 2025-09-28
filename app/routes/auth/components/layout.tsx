import { Outlet, type LinkProps } from "react-router";
import theme from "../lib/theme";
import css from "./ui.css?raw";
import type { CSSProperties } from "react";

export default function() {
  function get(key: "primary" | "background" | "logo", mode: "light" | "dark") {
    if (!theme[key]) return;
    if (typeof theme[key] === "string") return theme[key];

    return theme[key][mode] as string | undefined;
  }

  const radius = (() => {
    if (theme?.radius === "none") return "0";
    if (theme?.radius === "sm") return "1";
    if (theme?.radius === "md") return "1.25";
    if (theme?.radius === "lg") return "1.5";
    if (theme?.radius === "full") return "1000000000001";
    return "1";
  })();

  return (
    <div
      style={
        {
          "--color-background-light": get("background", "light"),
          "--color-background-dark": get("background", "dark"),
          "--color-primary-light": get("primary", "light"),
          "--color-primary-dark": get("primary", "dark"),
          "--font-family": theme?.font?.family,
          "--font-scale": theme?.font?.scale,
          "--border-radius": radius,
        } as CSSProperties
      }
    >
      <title>{theme?.title}</title>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {theme?.css && <style dangerouslySetInnerHTML={{ __html: theme.css }} />}
      <body>
        <div data-component="root">
          <div data-component="center">
            <img
              data-component="logo"
              src={get("logo", "light")}
              data-mode="light"
            />
            <img
              data-component="logo"
              src={get("logo", "dark")}
              data-mode="dark"
            />
            <Outlet />
          </div>
        </div>
      </body>
    </div>
  );
}

export const Links = ({}: LinkProps) => (
  <link rel="icon" href={theme?.favicon} />
);
