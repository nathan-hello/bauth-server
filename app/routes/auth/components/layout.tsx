import { Outlet, useNavigate } from "react-router";
import { useCopy } from "../lib/copy";

export default function () {
  const copy = useCopy();
  const navigate = useNavigate();
  return (
    <div>
      <title>{copy.meta.auth.title}</title>
      <div className="font-sans bg-[url('/carpark.webp')] bg-center bg-cover bg-fixed min-h-screen p-4 flex items-center justify-start flex-col select-none text-fg">
        <img
          onClick={() => navigate("/")}
          src="/favicon.ico"
          className="py-2 cursor-pointer mx-auto h-10 w-auto"
        />
        <Outlet />
      </div>
    </div>
  );
}
