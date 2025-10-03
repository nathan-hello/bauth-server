import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

type AlertType = "success" | "error" | "info" | "warning";

// Response types for better-auth API calls
interface TotpCodeResponse {
  code?: string;
  secret?: string;
}

interface ChangeEmailResponse {
  success?: boolean;
  message?: string;
}

interface EmailVerificationResponse {
  success?: boolean;
  message?: string;
}

interface BackupCodesResponse {
  backupCodes?: string[];
  success?: boolean;
}

interface LogoutResponse {
  success?: boolean;
  message?: string;
}

interface TotpSecretResponse {
  secret?: string;
  qrCodeUrl?: string;
  uri?: string;
}

interface AlertModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: AlertType;
}

interface PasswordModalState {
  isOpen: boolean;
  verify: (password: string) => void;
}

interface TwoFactorModalState {
  isOpen: boolean;
  type: "totp" | "email";
  verify: (code: string) => void;
}

interface BackupCodesModalState {
  isOpen: boolean;
  codes: string[];
}

interface QRCodeModalState {
  isOpen: boolean;
  secret: string;
  qrCodeUrl: string;
}

export function useAuthManagement() {
  const queryClient = useQueryClient();

  // Modal states
  const [alertModal, setAlertModal] = useState<AlertModalState>({
    isOpen: false,
    title: "",
    message: "",
    type: "info"
  });

  const [passwordModal, setPasswordModal] = useState<PasswordModalState>({
    isOpen: false,
    verify: () => {}
  });

  const [twoFactorModal, setTwoFactorModal] = useState<TwoFactorModalState>({
    isOpen: false,
    type: "totp",
    verify: () => {}
  });

  const [backupCodesModal, setBackupCodesModal] = useState<BackupCodesModalState>({
    isOpen: false,
    codes: []
  });

  const [qrCodeModal, setQrCodeModal] = useState<QRCodeModalState>({
    isOpen: false,
    secret: "",
    qrCodeUrl: ""
  });

  // Helper functions
  const showAlert = (title: string, message: string, type: AlertType = "info") => {
    setAlertModal({ isOpen: true, title, message, type });
  };

  const showPasswordModal = (onVerify: (password: string) => void) => {
    setPasswordModal({ isOpen: true, verify: onVerify });
  };

  const showTwoFactorModal = (type: "totp" | "email", onVerify: (code: string) => void) => {
    setTwoFactorModal({ isOpen: true, type, verify: onVerify });
  };

  const showBackupCodes = (codes: string[]) => {
    setBackupCodesModal({ isOpen: true, codes });
  };

  const showQRCode = (secret: string, qrCodeUrl?: string) => {
    setQrCodeModal({ isOpen: true, secret, qrCodeUrl });
  };

  // TOTP Code Generation Mutation
  const getTotpCodeMutation = useMutation<TotpCodeResponse, Error, { secret: string }>({
    mutationFn: (input: { secret: string }) => 
      trpc.auth.getTotpCodeFromSecret.mutationOptions(),
    onSuccess: (data: TotpCodeResponse) => {
      showAlert("TOTP Code Generated", "Your TOTP code has been generated successfully.", "success");
    },
    onError: (error: Error) => {
      showAlert("Error", `Failed to generate TOTP code: ${error.message}`, "error");
    }
  });

  // Change Email Mutation
  const changeEmailMutation = useMutation<ChangeEmailResponse, Error, { newEmail: string }>({
    mutationFn: (input: { newEmail: string }) => 
      trpc.auth.changeEmail.mutate(input),
    onSuccess: (data: ChangeEmailResponse) => {
      showAlert("Email Change Requested", "Please check your new email for verification instructions.", "success");
      // Invalidate user query to refresh user data
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: Error) => {
      showAlert("Error", `Failed to change email: ${error.message}`, "error");
    }
  });

  // Resend Email Verification Mutation
  const resendEmailVerificationMutation = useMutation<EmailVerificationResponse, Error, void>({
    mutationFn: () => trpc.auth.resendEmailVerification.mutate(),
    onSuccess: (data: EmailVerificationResponse) => {
      showAlert("Verification Email Sent", "Please check your email for verification instructions.", "success");
    },
    onError: (error: Error) => {
      showAlert("Error", `Failed to resend verification email: ${error.message}`, "error");
    }
  });

  // Generate Backup Codes Mutation
  const generateBackupCodesMutation = useMutation<BackupCodesResponse, Error, { password: string }>({
    mutationFn: (input: { password: string }) => 
      trpc.auth.generateBackupCodes.mutate(input),
    onSuccess: (data: BackupCodesResponse) => {
      if (data?.backupCodes && Array.isArray(data.backupCodes)) {
        showBackupCodes(data.backupCodes);
        showAlert("Backup Codes Generated", "Your backup codes have been generated. Please save them securely.", "success");
      } else {
        showAlert("Backup Codes Generated", "Your backup codes have been generated successfully.", "success");
      }
    },
    onError: (error: Error) => {
      showAlert("Error", `Failed to generate backup codes: ${error.message}`, "error");
    }
  });

  // Logout Everywhere Mutation
  const logoutEverywhereMutation = useMutation<LogoutResponse, Error, void>({
    mutationFn: () => trpc.auth.logoutEverywhere.mutate(),
    onSuccess: (data: LogoutResponse) => {
      showAlert("Logged Out Everywhere", "You have been logged out from all other devices.", "success");
      // Invalidate user query to refresh authentication state
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: Error) => {
      showAlert("Error", `Failed to logout from other devices: ${error.message}`, "error");
    }
  });

  // View TOTP Secret Mutation
  const viewTotpSecretMutation = useMutation<TotpSecretResponse, Error, { password: string }>({
    mutationFn: (input: { password: string }) => 
      trpc.auth.viewTotpSecret.mutate(input),
    onSuccess: (data: TotpSecretResponse) => {
      if (data?.secret) {
        showQRCode(data.secret, data.qrCodeUrl);
        showAlert("TOTP Secret Retrieved", "Your TOTP secret has been retrieved successfully.", "success");
      } else {
        showAlert("Error", "No TOTP secret found in response.", "error");
      }
    },
    onError: (error: Error) => {
      showAlert("Error", `Failed to retrieve TOTP secret: ${error.message}`, "error");
    }
  });

  // Convenience functions for common workflows
  const generateBackupCodesWithPassword = () => {
    showPasswordModal((password: string) => {
      generateBackupCodesMutation.mutate({ password });
      setPasswordModal(prev => ({ ...prev, isOpen: false }));
    });
  };

  const viewTotpSecretWithPassword = () => {
    showPasswordModal((password: string) => {
      viewTotpSecretMutation.mutate({ password });
      setPasswordModal(prev => ({ ...prev, isOpen: false }));
    });
  };

  // Loading states
  const isLoading = 
    getTotpCodeMutation.isPending ||
    changeEmailMutation.isPending ||
    resendEmailVerificationMutation.isPending ||
    generateBackupCodesMutation.isPending ||
    logoutEverywhereMutation.isPending ||
    viewTotpSecretMutation.isPending;

  return {
    // Modal states and helpers
    alertModal: {
      ...alertModal,
      close: () => setAlertModal(prev => ({ ...prev, isOpen: false }))
    },
    passwordModal: {
      ...passwordModal,
      close: () => setPasswordModal(prev => ({ ...prev, isOpen: false }))
    },
    twoFactorModal: {
      ...twoFactorModal,
      close: () => setTwoFactorModal(prev => ({ ...prev, isOpen: false }))
    },
    backupCodesModal: {
      ...backupCodesModal,
      close: () => setBackupCodesModal(prev => ({ ...prev, isOpen: false }))
    },
    qrCodeModal: {
      ...qrCodeModal,
      close: () => setQrCodeModal(prev => ({ ...prev, isOpen: false }))
    },
    
    // Modal helper functions
    showAlert,
    showPasswordModal,
    showTwoFactorModal,
    showBackupCodes,
    showQRCode,

    // Direct mutation functions
    getTotpCode: getTotpCodeMutation.mutate,
    changeEmail: changeEmailMutation.mutate,
    resendEmailVerification: resendEmailVerificationMutation.mutate,
    logoutEverywhere: logoutEverywhereMutation.mutate,
    
    // Convenience functions with password modals
    generateBackupCodesWithPassword,
    viewTotpSecretWithPassword,

    // Loading states
    isLoading,
    loadingStates: {
      getTotpCode: getTotpCodeMutation.isPending,
      changeEmail: changeEmailMutation.isPending,
      resendEmailVerification: resendEmailVerificationMutation.isPending,
      generateBackupCodes: generateBackupCodesMutation.isPending,
      logoutEverywhere: logoutEverywhereMutation.isPending,
      viewTotpSecret: viewTotpSecretMutation.isPending,
    },

    // Error states
    errors: {
      getTotpCode: getTotpCodeMutation.error,
      changeEmail: changeEmailMutation.error,
      resendEmailVerification: resendEmailVerificationMutation.error,
      generateBackupCodes: generateBackupCodesMutation.error,
      logoutEverywhere: logoutEverywhereMutation.error,
      viewTotpSecret: viewTotpSecretMutation.error,
    }
  };
}
