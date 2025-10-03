import {  useNavigate } from "react-router";
import { useEffect, useRef } from "react";
import { authClient } from "@/lib/auth";

export function meta() {
  return [
    { title: "Sign Out - Playlist PowerTools" },
    {
      name: "description",
      content: "Sign out of your Playlist PowerTools account",
    },
  ];
}

export default function SignOut() {
  const signingOut = useRef(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (signingOut.current) return;
    signingOut.current = true;

    authClient.signOut().finally(() => navigate("/"));
  }, [authClient, navigate]);

  return null;
}
