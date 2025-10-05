import { Outlet } from "react-router";
import css from "./ui.css?raw";
import { useCopy } from "../lib/copy";

export default function () {
  const copy = useCopy();
  return (
    <div>
      <title>{copy.meta.auth.title}</title>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <body>
        <div data-component="root">
          <div data-component="center">
            <img data-component="logo" data-mode="light" src="/favicon.ico" />
            <img data-component="logo" data-mode="dark" src="/favicon.ico" />
            <Outlet />
          </div>
        </div>
      </body>
    </div>
  );
}

