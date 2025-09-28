import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth";
import { useState } from "react";

export function useAuthManagement() {
  const queryClient = useQueryClient();

  // Modal states
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning"
  });

  const [passwordModal, setPasswordModal] = useState({
    isOpen: false,
    verify: (password: string) => {}
  });

  const [twoFactorModal, setTwoFactorModal] = useState({
    isOpen: false,
    type: "totp" as "totp" | "email",
    verify: (code: string) => {}
  });

  const [backupCodesModal, setBackupCodesModal] = useState({
    isOpen: false,
    codes: [] as string[]
  });

  const [qrCodeModal, setQrCodeModal] = useState({
    isOpen: false,
    secret: "",
    qrCodeUrl: ""
  });

  // Helper functions
  const showAlert = (title: string, message: string, type: "success" | "error" | "info" | "warning" = "info") => {
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

  // Email verification mutations
  const resendEmailMutation = useMutation({
    mutationFn: async () => {
      return await authClient.resendEmailVerification();
    },
    onSuccess: () => {
      showAlert("Success", "Verification email sent!", "success");
    },
    onError: (error) => {
      console.error("Failed to resend verification email:", error);
      showAlert("Error", "Failed to send verification email", "error");
    },
  });

  const changeEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      return await authClient.changeEmail({ email });
    },
    onSuccess: () => {
      showAlert("Success", "Email change request sent! Check your new email for verification.", "success");
      queryClient.invalidateQueries({ queryKey: ["better-auth", "session"] });
    },
    onError: (error) => {
      console.error("Failed to change email:", error);
      showAlert("Error", "Failed to change email", "error");
    },
  });

  // 2FA mutations
  const disableEmailOTPMutation = useMutation({
    mutationFn: async () => {
      return await authClient.disableTwoFactor({ type: "email" });
    },
    onSuccess: () => {
      showAlert("Success", "Email OTP disabled successfully", "success");
      queryClient.invalidateQueries({ queryKey: ["better-auth", "session"] });
    },
    onError: (error) => {
      console.error("Failed to disable email OTP:", error);
      showAlert("Error", "Failed to disable email OTP", "error");
    },
  });

  const enableTOTPMutation = useMutation({
    mutationFn: async () => {
      return await authClient.enableTwoFactor({ type: "totp" });
    },
    onSuccess: (data) => {
      showQRCode(data.secret, data.qrCodeUrl);
      queryClient.invalidateQueries({ queryKey: ["better-auth", "session"] });
    },
    onError: (error) => {
      console.error("Failed to enable TOTP:", error);
      showAlert("Error", "Failed to enable TOTP", "error");
    },
  });

  const verifyTOTPMutation = useMutation({
    mutationFn: async (code: string) => {
      return await authClient.verifyTwoFactor({ type: "totp", code });
    },
    onSuccess: () => {
      showAlert("Success", "TOTP verified successfully!", "success");
      queryClient.invalidateQueries({ queryKey: ["better-auth", "session"] });
    },
    onError: (error) => {
      console.error("Failed to verify TOTP:", error);
      showAlert("Error", "Invalid TOTP code", "error");
    },
  });

  const resetTOTPSecretMutation = useMutation({
    mutationFn: async () => {
      return await authClient.resetTwoFactorSecret({ type: "totp" });
    },
    onSuccess: (data) => {
      showQRCode(data.secret, data.qrCodeUrl);
      queryClient.invalidateQueries({ queryKey: ["better-auth", "session"] });
    },
    onError: (error) => {
      console.error("Failed to reset TOTP secret:", error);
      showAlert("Error", "Failed to reset TOTP secret", "error");
    },
  });

  const generateBackupCodesMutation = useMutation({
    mutationFn: async () => {
      return await authClient.generateBackupCodes();
    },
    onSuccess: (data) => {
      showBackupCodes(data.codes);
    },
    onError: (error) => {
      console.error("Failed to generate backup codes:", error);
      showAlert("Error", "Failed to generate backup codes", "error");
    },
  });

  // Session management mutations
  const logoutEverywhereMutation = useMutation({
    mutationFn: async () => {
      return await authClient.logoutEverywhere();
    },
    onSuccess: () => {
      showAlert("Success", "Logged out from all devices", "success");
      queryClient.invalidateQueries({ queryKey: ["better-auth", "sessions"] });
    },
    onError: (error) => {
      console.error("Failed to logout everywhere:", error);
      showAlert("Error", "Failed to logout from all devices", "error");
    },
  });

  const logoutSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return await authClient.logoutSession({ sessionId });
    },
    onSuccess: () => {
      showAlert("Success", "Session logged out", "success");
      queryClient.invalidateQueries({ queryKey: ["better-auth", "sessions"] });
    },
    onError: (error) => {
      console.error("Failed to logout session:", error);
      showAlert("Error", "Failed to logout session", "error");
    },
  });

  return {
    // Email mutations
    resendEmailMutation,
    changeEmailMutation,
    
    // 2FA mutations
    disableEmailOTPMutation,
    enableTOTPMutation,
    verifyTOTPMutation,
    resetTOTPSecretMutation,
    generateBackupCodesMutation,
    
    // Session mutations
    logoutEverywhereMutation,
    logoutSessionMutation,

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
    showAlert,
    showPasswordModal,
    showTwoFactorModal,
    showBackupCodes,
    showQRCode,
  };
}