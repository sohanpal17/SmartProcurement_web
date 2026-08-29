import React, { useState } from "react";
import { useApp } from "../../context/AppContext";

export function LoginModal({ isOpen, onClose }) {
  const { authUser, loginUser, registerUser, logoutUser, addToast: showToast } = useApp();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("officer"); // 'admin' or 'officer'
  const [officerRole, setOfficerRole] = useState("Weighing Officer");
  const [mandiId, setMandiId] = useState("turbhe");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen && authUser) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          officerRole: role === "officer" ? officerRole : "Admin",
          mandiId: role === "officer" || role === "admin" ? mandiId : null,
        });

        if (res.success) {
          if (role === "officer") {
            showToast("Officer registration submitted! Pending Mandi Admin approval.", "info");
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

  const handleQuickAdminLogin = async (presetEmail, presetPass) => {
    setEmail(presetEmail);
    setPassword(presetPass);
    setLoading(true);
    setErrorMsg("");
    const res = await loginUser(presetEmail, presetPass);
    setLoading(false);
    if (res.success) {
      showToast(`Logged in as ${res.user.fullName}`, "success");
      if (onClose) onClose();
    } else {
      setErrorMsg(res.error || "Login failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-slate-100 relative transition-all">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 mb-3 font-bold text-xl shadow-sm">
            🌿
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            {authUser ? "Account Profile" : isRegisterMode ? "Create Officer Account" : "SmartProcure Admin Portal"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {authUser
              ? `Logged in as ${authUser.fullName} (${authUser.role})`
              : isRegisterMode
              ? "Register a new Procurement Officer account for Mandi Admin approval"
              : "Sign in with Mandi Admin or Officer credentials"}
          </p>
        </div>

        {/* If Already Logged In */}
        {authUser ? (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Authenticated User</div>
              <div className="font-bold text-slate-800 text-lg">{authUser.fullName}</div>
              <div className="text-sm text-slate-600">{authUser.email}</div>
              <div className="mt-2 flex gap-2">
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full uppercase">
                  Role: {authUser.role}
                </span>
                {authUser.mandiId && (
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full uppercase">
                    Mandi: {authUser.mandiId}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                logoutUser();
                showToast("Logged out successfully", "info");
              }}
              className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl transition"
            >
              Sign Out
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition"
              >
                Close
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Quick Demo Credentials Presets */}
            {!isRegisterMode && (
              <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quick Mandi Admin Login:</div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickAdminLogin("turbhe@gmail.com", "turbhe123")}
                      className="px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition shadow-sm"
                    >
                      Turbhe Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAdminLogin("vashi@gmail.com", "vashi123")}
                      className="px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition shadow-sm"
                    >
                      Vashi Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAdminLogin("sanpada@gmail.com", "sanpada123")}
                      className="px-2 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition shadow-sm"
                    >
                      Sanpada Admin
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quick Turbhe Officer Logins:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleQuickAdminLogin("tofficer1@gmail.com", "123456")}
                      className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition text-center truncate"
                      title="tofficer1@gmail.com (Arrival & Token)"
                    >
                      1. Arrival Officer
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAdminLogin("tofficer2@gmail.com", "123456")}
                      className="p-1.5 bg-[#102A56] hover:bg-[#1b3a70] text-white font-medium rounded-lg transition text-center truncate"
                      title="tofficer2@gmail.com (Weighing Officer)"
                    >
                      2. Weighing Officer
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAdminLogin("tofficer3@gmail.com", "123456")}
                      className="p-1.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition text-center truncate"
                      title="tofficer3@gmail.com (Quality Check)"
                    >
                      3. Quality Officer
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAdminLogin("tofficer4@gmail.com", "123456")}
                      className="p-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition text-center truncate"
                      title="tofficer4@gmail.com (Procurement Officer)"
                    >
                      4. Procurement
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAdminLogin("tofficer5@gmail.com", "123456")}
                      className="p-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-lg transition text-center truncate col-span-2 sm:col-span-1"
                      title="tofficer5@gmail.com (Payment Officer)"
                    >
                      5. Payment Officer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-medium">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Login / Register Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegisterMode && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ramesh Patil"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>

                  {role === "officer" && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Requested Officer Role</label>
                      <select
                        value={officerRole}
                        onChange={(e) => setOfficerRole(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white font-medium text-slate-800"
                      >
                        <option value="Arrival & Token Officer">Arrival & Token Officer</option>
                        <option value="Weighing Officer">Weighing Officer</option>
                        <option value="Quality Check Officer">Quality Check Officer</option>
                        <option value="Procurement & Price Officer">Procurement & Price Officer</option>
                        <option value="Payment Officer">Payment Officer</option>
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Account Category</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                      >
                        <option value="officer">Procurement Officer</option>
                        <option value="admin">Mandi Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Assigned Mandi</label>
                      <select
                        value={mandiId}
                        onChange={(e) => setMandiId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
                      >
                        <option value="turbhe">Turbhe Mandi</option>
                        <option value="vashi">Vashi Mandi</option>
                        <option value="sanpada">Sanpada Mandi</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mandiexample.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl transition shadow-md shadow-emerald-600/20 text-sm"
              >
                {loading ? "Processing..." : isRegisterMode ? "Register Officer Account" : "Sign In"}
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-5 text-center text-xs text-slate-500">
              {isRegisterMode ? (
                <span>
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setIsRegisterMode(false);
                      setErrorMsg("");
                    }}
                    className="text-emerald-600 font-bold hover:underline"
                  >
                    Sign In
                  </button>
                </span>
              ) : (
                <span>
                  Need a Procurement Officer account?{" "}
                  <button
                    onClick={() => {
                      setIsRegisterMode(true);
                      setErrorMsg("");
                    }}
                    className="text-emerald-600 font-bold hover:underline"
                  >
                    Register Officer
                  </button>
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
