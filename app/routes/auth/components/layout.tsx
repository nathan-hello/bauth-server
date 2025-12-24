import { Outlet, useNavigate } from "react-router";
import css from "./ui.css?raw";
import { useCopy } from "../lib/copy";

export default function () {
  const copy = useCopy();
  const navigate = useNavigate();
  return (
    <div>
      <title>{copy.meta.auth.title}</title>
      <style
        dangerouslySetInnerHTML={{
          __html: css,
        }}
      />
      <body>
        <div data-component="root">
          <img
            onClick={() => navigate("/")}
            data-component="logo"
            data-mode="light"
            src="/favicon.ico"
            className="py-2 cursor-pointer w-full"
          />
          <img
            onClick={() => navigate("/")}
            data-component="logo"
            data-mode="dark"
            src="/favicon.ico"
            className="py-2 cursor-pointer w-full"
          />
          <Outlet />
        </div>
      </body>
    </div>
  );
}
