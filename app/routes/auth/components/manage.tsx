import { authClient } from "@/lib/auth"
import { useQuery } from "@tanstack/react-query";
import { useAuthManagement } from "../hooks/useAuthManagement";
import { useState } from "react";

// Modal Components
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <button
          onClick={onClose}
          className="float-right text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

function AlertModal({ isOpen, onClose, title, message, type = "info" }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "error" | "info" | "warning";
}) {
  const colors = {
    success: "text-green-600",
    error: "text-red-600",
    info: "text-blue-600",
    warning: "text-yellow-600"
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <h3 className={`text-lg font-semibold ${colors[type]}`}>{title}</h3>
        <p className="text-gray-700">{message}</p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          OK
        </button>
      </div>
    </Modal>
  );
}

function PasswordVerificationModal({ isOpen, onClose, onVerify }: {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (password: string) => void;
}) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = formData.get("password") as string;
    if (password) {
      onVerify(password);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Verify Password</h3>
        <p className="text-gray-700">Please enter your password to continue:</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            className="w-full px-3 py-2 border rounded"
            required
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Verify
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function TwoFactorVerificationModal({ isOpen, onClose, onVerify, type = "totp" }: {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => void;
  type?: "totp" | "email";
}) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const code = formData.get("code") as string;
    if (code) {
      onVerify(code);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Verify 2FA Code</h3>
        <p className="text-gray-700">
          {type === "totp" 
            ? "Enter the 6-digit code from your authenticator app:" 
            : "Enter the verification code sent to your email:"
          }
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="code"
            placeholder={type === "totp" ? "123456" : "Enter code"}
            className="w-full px-3 py-2 border rounded"
            maxLength={type === "totp" ? 6 : undefined}
            required
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Verify
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

function BackupCodesModal({ isOpen, onClose, codes }: {
  isOpen: boolean;
  onClose: () => void;
  codes: string[];
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-orange-600">⚠️ Backup Codes</h3>
        <p className="text-gray-700">
          Save these backup codes in a secure location. Each code can only be used once.
        </p>
        <div className="bg-gray-100 p-4 rounded space-y-2">
          {codes.map((code, index) => (
            <div key={index} className="font-mono text-sm">{code}</div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          I've Saved These Codes
        </button>
      </div>
    </Modal>
  );
}

function QRCodeModal({ isOpen, onClose, secret, qrCodeUrl }: {
  isOpen: boolean;
  onClose: () => void;
  secret: string;
  qrCodeUrl?: string;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">TOTP Setup</h3>
        <p className="text-gray-700">
          Scan this QR code with your authenticator app or manually enter the secret:
        </p>
        
        {qrCodeUrl && (
          <div className="flex justify-center">
            <img src={qrCodeUrl} alt="QR Code" className="border rounded" />
          </div>
        )}
        
        <div className="bg-gray-100 p-4 rounded">
          <p className="text-sm text-gray-600 mb-2">Secret Key:</p>
          <p className="font-mono text-sm break-all">{secret}</p>
        </div>
        
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          I've Set Up My Authenticator
        </button>
      </div>
    </Modal>
  );
}

// Section Components
function EmailVerificationSection({ user, mutations }: {
  user: any;
  mutations: ReturnType<typeof useAuthManagement>;
}) {
  const handleChangeEmail = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    
    if (email && email.includes("@")) {
      mutations.changeEmailMutation.mutate(email);
    } else {
      mutations.showAlert("Invalid Email", "Please enter a valid email address", "error");
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h2 className="text-lg font-semibold">Email Verification</h2>
      <div className="flex flex-col sm:flex-row gap-4">
        {user.emailVerified ? (
          <form onSubmit={handleChangeEmail} className="flex gap-2 w-full">
            <input
              type="email"
              name="email"
              placeholder="New email address"
              className="flex-1 px-3 py-2 border rounded"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              disabled={mutations.changeEmailMutation.isPending}
            >
              {mutations.changeEmailMutation.isPending ? "Sending..." : "Change Email"}
            </button>
          </form>
        ) : (
          <button
            onClick={() => mutations.resendEmailMutation.mutate()}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
            disabled={mutations.resendEmailMutation.isPending}
          >
            {mutations.resendEmailMutation.isPending ? "Sending..." : "Resend Email Verification"}
          </button>
        )}
      </div>
    </div>
  );
}

function TwoFactorSection({ mutations }: {
  mutations: ReturnType<typeof useAuthManagement>;
}) {
  const handleVerifyTOTP = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const code = formData.get("totpCode") as string;
    
    if (code && code.length === 6) {
      mutations.verifyTOTPMutation.mutate(code);
    } else {
      mutations.showAlert("Invalid Code", "Please enter a valid 6-digit TOTP code", "error");
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h2 className="text-lg font-semibold">2FA Settings</h2>
      
      {/* Email OTP */}
      <div className="flex justify-between items-center">
        <span className="font-medium">Email OTP</span>
        <button
          onClick={() => mutations.disableEmailOTPMutation.mutate()}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          disabled={mutations.disableEmailOTPMutation.isPending}
        >
          {mutations.disableEmailOTPMutation.isPending ? "Disabling..." : "Disable"}
        </button>
      </div>

      {/* TOTP */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-medium">TOTP</span>
          <button
            onClick={() => mutations.enableTOTPMutation.mutate()}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            disabled={mutations.enableTOTPMutation.isPending}
          >
            {mutations.enableTOTPMutation.isPending ? "Enabling..." : "Enable"}
          </button>
        </div>
        
        <form onSubmit={handleVerifyTOTP} className="flex gap-2">
          <input
            type="text"
            name="totpCode"
            placeholder="6-digit TOTP code"
            className="flex-1 px-3 py-2 border rounded"
            maxLength={6}
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={mutations.verifyTOTPMutation.isPending}
          >
            {mutations.verifyTOTPMutation.isPending ? "Verifying..." : "Verify"}
          </button>
        </form>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => mutations.resetTOTPSecretMutation.mutate()}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
          disabled={mutations.resetTOTPSecretMutation.isPending}
        >
          {mutations.resetTOTPSecretMutation.isPending ? "Resetting..." : "Reset Secret"}
        </button>
        <button
          onClick={() => mutations.generateBackupCodesMutation.mutate()}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          disabled={mutations.generateBackupCodesMutation.isPending}
        >
          {mutations.generateBackupCodesMutation.isPending ? "Generating..." : "Get New Backup Codes"}
        </button>
      </div>
    </div>
  );
}

function SessionManagementSection({ sessions, mutations }: {
  sessions: any;
  mutations: ReturnType<typeof useAuthManagement>;
}) {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Active Sessions</h2>
        <button
          onClick={() => mutations.logoutEverywhereMutation.mutate()}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          disabled={mutations.logoutEverywhereMutation.isPending}
        >
          {mutations.logoutEverywhereMutation.isPending ? "Logging Out..." : "Log Out Everywhere"}
        </button>
      </div>
      
      {sessions.isPending ? (
        <div>Loading sessions...</div>
      ) : sessions.error ? (
        <div className="text-red-500">Failed to load sessions</div>
      ) : sessions.data && sessions.data.length > 0 ? (
        <div className="space-y-2">
          {sessions.data.map((session: any) => (
            <div key={session.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <div className="font-medium">{session.ipAddress}</div>
                <div className="text-sm text-gray-600">
                  Last logged in: {new Date(session.updatedAt).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => mutations.logoutSessionMutation.mutate(session.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 text-sm"
                disabled={mutations.logoutSessionMutation.isPending}
              >
                {mutations.logoutSessionMutation.isPending ? "Logging Out..." : "Logout"}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500">No active sessions found</div>
      )}
    </div>
  );
}

export function AuthManage() {
  const { data, error, isPending } = authClient.useSession();
  const mutations = useAuthManagement();

  if (!data || !data.user) {
    return <div className="p-4">Please log in to manage your account.</div>
  }

  const sessions = useQuery({
    queryKey: ["better-auth", "sessions"],
    queryFn: async () => {
      return await authClient.listSessions();
    }
  });

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Account Management</h1>
      
      <EmailVerificationSection user={data.user} mutations={mutations} />
      <TwoFactorSection mutations={mutations} />
      <SessionManagementSection sessions={sessions} mutations={mutations} />

      {/* Modals */}
      <AlertModal
        isOpen={mutations.alertModal.isOpen}
        onClose={mutations.alertModal.close}
        title={mutations.alertModal.title}
        message={mutations.alertModal.message}
        type={mutations.alertModal.type}
      />
      
      <PasswordVerificationModal
        isOpen={mutations.passwordModal.isOpen}
        onClose={mutations.passwordModal.close}
        onVerify={mutations.passwordModal.verify}
      />
      
      <TwoFactorVerificationModal
        isOpen={mutations.twoFactorModal.isOpen}
        onClose={mutations.twoFactorModal.close}
        onVerify={mutations.twoFactorModal.verify}
        type={mutations.twoFactorModal.type}
      />
      
      <BackupCodesModal
        isOpen={mutations.backupCodesModal.isOpen}
        onClose={mutations.backupCodesModal.close}
        codes={mutations.backupCodesModal.codes}
      />
      
      <QRCodeModal
        isOpen={mutations.qrCodeModal.isOpen}
        onClose={mutations.qrCodeModal.close}
        secret={mutations.qrCodeModal.secret}
        qrCodeUrl={mutations.qrCodeModal.qrCodeUrl}
      />
    </div>
  );
}
