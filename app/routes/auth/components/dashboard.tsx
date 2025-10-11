import { Form } from "react-router";
import { FormAlert } from "./form";
import { useCopy } from "../lib/copy";
import { QRCode } from "@/components/qr";
import { useState } from "react";
import type { AuthError } from "../errors/auth-error";

export type DashboardState = {
  two_factor: {
  totp: {
      enabled: boolean
      totpUri: string;
      backupCodes: string[];
    }
    email: {
      enabled: boolean;
    }
  }
  email: {
    email: string,
    verified: boolean,
  }

  sessions: {
    ipAddress: string,
    lastLoggedIn: Date,
  }[]

};

type DashboardProps = {
  state?: DashboardState;
};

export function Dashboard({ state }: DashboardProps) {
  const copy = useCopy();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  return null

}
