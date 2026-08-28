import React from "react";
import { useApp } from "../../context/AppContext";
import { CheckCircle2, AlertTriangle, Info, Clock, X } from "lucide-react";

export const ToastContainer = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        const bg =
          toast.type === "error"
            ? "bg-rose-900 text-white border-rose-700"
            : toast.type === "warning"
            ? "bg-amber-900 text-white border-amber-700"
            : toast.type === "info"
            ? "bg-[#102A56] text-white border-[#1b365d]"
            : "bg-emerald-900 text-white border-emerald-700";

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl border shadow-xl text-sm font-medium transition-all transform animate-in slide-in-from-bottom-5 ${bg}`}
          >
            <div className="flex items-center gap-3">
              {toast.type === "error" && <AlertTriangle className="w-4 h-4 text-rose-400" />}
              {toast.type === "warning" && <Clock className="w-4 h-4 text-amber-400" />}
              {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {toast.type === "info" && <Info className="w-4 h-4 text-blue-300" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
