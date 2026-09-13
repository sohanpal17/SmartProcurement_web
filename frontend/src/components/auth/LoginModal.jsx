import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Landmark, Lock, Mail, Key } from "lucide-react";
import { ROLES } from "../../data/mockData";

export function LoginModal({ isOpen, onClose }) {
  const { authUser, loginUser, registerUser, logoutUser, setCurrentDemoRole, addToast: showToast } = useApp();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("officer");
  const [officerRole, setOfficerRole] = useState("Weighing Staff");
  const [mandiId, setMandiId] = useState("turbhe");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen && authUser) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isRegisterMode && !agreedTerms) {
      alert("Please check the official authorization confirmation box before signing in.");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      if (isRegisterMode) {
        const res = await registerUser({
          email,
          password,
          fullName,
          phone,
          role,
          officerRole: role === "officer" ? officerRole : "Centre Administrator",
          mandiId: role === "officer" || role === "admin" ? mandiId : null,
        });

        if (res.success) {
          if (role === "officer") {
            showToast("Officer registration submitted! Pending Centre Admin approval.", "info");
            setIsRegisterMode(false);
          } else {
            showToast("Registered successfully!", "success");
            if (onClose) onClose();
          }
        } else {
          setErrorMsg(res.error || "Registration failed.");
        }
      } else {
        const res = await loginUser(email, password);
        if (res.success) {
          showToast(`Welcome back, ${res.user.fullName}!`, "success");
          if (onClose) onClose();
        } else {
          setErrorMsg(res.error || "Login failed.");
        }
      }
    } catch (err) {
      setErrorMsg("Connection error to backend server.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoRole = (roleName) => {
    setCurrentDemoRole(roleName);
    if (!authUser) {
      loginUser(`${roleName.toLowerCase().replace(/\s+/g, '')}@apmc.maha.gov.in`, "demo123");
    }
    showToast(`Signed in & switched workstation to: ${roleName}`, "info");
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-100 rounded-2xl shadow-2xl max-w-xl w-full border border-slate-300 overflow-hidden animate-fade-in my-8">
        {/* Top Government Title Header */}
        <div className="bg-[#0F2B5C] text-white p-4 sm:p-5 flex items-center justify-between border-b border-amber-400">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#0F2B5C]">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">SmartProcure Admin Portal</h2>
              <p className="text-xs text-blue-200 font-medium">Agricultural Produce Market Committee (APMC) — Navi Mumbai</p>
            </div>
          </div>
          {onClose && authUser && (
            <button onClick={onClose} className="text-slate-300 hover:text-white font-bold text-lg cursor-pointer">✕</button>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="gov-card p-6 border-slate-300">
            <div className="flex items-center gap-2 mb-4 text-[#0F2B5C]">
              <Lock className="w-5 h-5" />
              <h3 className="text-base font-extrabold">Authorised User Sign In</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              Access restricted to registered APMC Centre officials only.
            </p>

            {/* Evaluator Quick Access Buttons */}
            <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 mb-5 space-y-3">
              <span className="text-[10px] font-black uppercase text-[#0F2B5C] block">
                ⚡ QUICK ACCESS — EVALUATOR DEMO ROLES
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickDemoRole(ROLES.ADMIN)}
                  className="p-2 bg-white hover:bg-amber-50 text-[#0F2B5C] font-extrabold rounded-lg border border-blue-300 shadow-2xs text-left cursor-pointer"
                >
                  👑 Centre Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoRole(ROLES.CHECKIN)}
                  className="p-2 bg-white hover:bg-[#15803D]/10 text-emerald-800 font-extrabold rounded-lg border border-emerald-300 shadow-2xs text-left cursor-pointer"
                >
                  📌 Check-in Staff
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoRole(ROLES.WEIGHING)}
                  className="p-2 bg-white hover:bg-[#15803D]/10 text-emerald-800 font-extrabold rounded-lg border border-emerald-300 shadow-2xs text-left cursor-pointer"
                >
                  ⚖️ Weighing Staff
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoRole(ROLES.QUALITY)}
                  className="p-2 bg-white hover:bg-[#15803D]/10 text-emerald-800 font-extrabold rounded-lg border border-emerald-300 shadow-2xs text-left cursor-pointer"
                >
                  🔬 Quality Staff
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoRole(ROLES.PAYMENT)}
                  className="p-2 bg-white hover:bg-[#15803D]/10 text-emerald-800 font-extrabold rounded-lg border border-emerald-300 shadow-2xs text-left cursor-pointer"
                >
                  💳 Payment Staff
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 mb-4">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Credential Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="user@apmc.maha.gov.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0F2B5C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0F2B5C]"
                  />
                </div>
              </div>

              {/* Agreement Checkbox */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="govConfirm"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 rounded text-[#0F2B5C] focus:ring-[#0F2B5C]"
                />
                <label htmlFor="govConfirm" className="text-[11px] text-slate-600 font-medium">
                  I confirm that I am an authorised official accessing this portal for official government procurement purposes only.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#0F2B5C] hover:bg-[#091C3E] text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? "Authenticating..." : "➔ Sign In to Portal"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}





