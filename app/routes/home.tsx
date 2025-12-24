import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {}

export function meta() {
  return [
    { title: "Asdf" },
    {
      name: "description",
      content: "asdf asdf asdf",
    },
  ];
}

export default function () {
  return <div className="min-h-[100dvh] bg-gradient-to-b from-emerald-50 to-white">asdf</div>;
}
