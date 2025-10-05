import { useNavigate } from "react-router";
import { useEffect, useRef } from "react";
import { authClient } from "@/lib/auth";
import { useCopy } from "./lib/copy";




export default function SignOut() {
  const copy = useCopy();
  const signingOut = useRef(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (signingOut.current) return;
    signingOut.current = true;

    authClient.signOut().finally(() => navigate("/"));
  }, [authClient, navigate]);

  return (
    <>
      <title>{copy.meta.login.title}</title>
    </>
  );
}
