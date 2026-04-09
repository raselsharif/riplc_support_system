import { useState, useEffect } from "react";
import AdminLayout from "../layouts/AdminLayout";
import api from "../services/api";
import { useToast } from "../contexts/ToastContext";

const TwoFactorSettings = () => {
  const { addToast } = useToast();
  const [enabled, setEnabled] = useState(false);
  const [secret, setSecret] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState("disabled");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await api.get("/2fa/status");
      setEnabled(res.data.enabled);
      setStep(res.data.enabled ? "enabled" : "disabled");
    } catch (error) {}
  };

  const handleEnable = async () => {
    setLoading(true);
    try {
      const res = await api.post("/2fa/enable");
      setSecret(res.data.secret);
      setQrUrl(res.data.otpauth_url);
      setStep("verify");
    } catch (error) {
      addToast({ type: "error", message: "Failed to enable 2FA" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!token || token.length < 6) {
      addToast({ type: "error", message: "Enter a valid 6-digit code" });
      return;
    }
    setLoading(true);
    try {
      await api.post("/2fa/verify", { token });
      setEnabled(true);
      setStep("enabled");
      addToast({ type: "success", message: "2FA enabled successfully" });
    } catch (error) {
      addToast({ type: "error", message: "Invalid verification code" });
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!token || token.length < 6) {
      addToast({ type: "error", message: "Enter your current 2FA code to disable" });
      return;
    }
    setLoading(true);
    try {
      await api.post("/2fa/disable", { token });
      setEnabled(false);
      setStep("disabled");
      setSecret("");
      setToken("");
      addToast({ type: "success", message: "2FA disabled" });
    } catch (error) {
      addToast({ type: "error", message: "Invalid code" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Two-Factor Authentication</h1>
        <p className="text-sm text-gray-500 mb-6">Add an extra layer of security to your account</p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {step === "disabled" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2FA is not enabled</h3>
              <p className="text-sm text-gray-500 mb-6">Protect your account with time-based one-time passwords</p>
              <button
                onClick={handleEnable}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
              >
                {loading ? "Generating..." : "Enable 2FA"}
              </button>
            </div>
          )}

          {step === "verify" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Scan QR Code</h3>
              <p className="text-sm text-gray-500 mb-4">
                Scan this QR code with Google Authenticator, Authy, or any TOTP app
              </p>
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-center">
                <p className="text-xs text-gray-400 mb-2">Or manually enter this secret:</p>
                <code className="text-sm font-mono bg-white px-3 py-1.5 rounded border">{secret}</code>
              </div>
              <div className="max-w-xs mx-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Verification Code</label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleVerify}
                  disabled={loading}
                  className="w-full mt-3 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                >
                  {loading ? "Verifying..." : "Verify & Enable"}
                </button>
              </div>
            </div>
          )}

          {step === "enabled" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2FA is enabled</h3>
              <p className="text-sm text-gray-500 mb-6">Your account is protected with two-factor authentication</p>
              <div className="max-w-xs mx-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Enter 2FA code to disable</label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleDisable}
                  disabled={loading}
                  className="w-full mt-3 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                >
                  {loading ? "Disabling..." : "Disable 2FA"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default TwoFactorSettings;
