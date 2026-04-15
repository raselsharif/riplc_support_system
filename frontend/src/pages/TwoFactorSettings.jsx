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
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--primary-light), var(--primary))" }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Two-Factor Authentication</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Add an extra layer of security to your account</p>
          </div>
        </div>

        <div className="rounded-xl border p-6" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)" }}>
          {step === "disabled" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--bg-muted), var(--bg-secondary))" }}>
                <svg className="w-8 h-8" style={{ color: "var(--text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">2FA is not enabled</h3>
              <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Protect your account with time-based one-time passwords</p>
              <button
                onClick={handleEnable}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-active))" }}
              >
                {loading ? "Generating..." : "Enable 2FA"}
              </button>
            </div>
          )}

          {step === "verify" && (
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Scan QR Code</h3>
              <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                Scan this QR code with Google Authenticator, Authy, or any TOTP app
              </p>
              <div className="rounded-xl p-6 mb-6 text-center" style={{ backgroundColor: "var(--bg-muted)" }}>
                <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Or manually enter this secret:</p>
                <code className="text-sm font-mono px-3 py-1.5 rounded-lg border inline-block" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-default)", color: "var(--text-primary)" }}>{secret}</code>
              </div>
              <div className="max-w-xs mx-auto">
                <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>Verification Code</label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 border rounded-xl text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
                  style={{ borderColor: "var(--input-border)", backgroundColor: "var(--input-bg)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
                />
                <button
                  onClick={handleVerify}
                  disabled={loading}
                  className="w-full mt-4 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-active))" }}
                >
                  {loading ? "Verifying..." : "Verify & Enable"}
                </button>
              </div>
            </div>
          )}

          {step === "enabled" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30">
                <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">2FA is enabled</h3>
              <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>Your account is protected with two-factor authentication</p>
              <div className="max-w-xs mx-auto">
                <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>Enter 2FA code to disable</label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 border rounded-xl text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
                  style={{ borderColor: "var(--input-border)", backgroundColor: "var(--input-bg)", color: "var(--text-primary)", "--tw-ring-color": "var(--primary)" }}
                />
                <button
                  onClick={handleDisable}
                  disabled={loading}
                  className="w-full mt-4 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 bg-rose-500 hover:bg-rose-600"
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
