import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertCircle,
  info: Info,
};

const Toast = ({ message, type = "success", onClose }) => {
  const styles = {
    success: "bg-success-600 text-white",
    error: "bg-danger-600 text-white",
    warning: "bg-warning-600 text-white",
    info: "bg-brand-600 text-white",
  };
  const Icon = ICONS[type] || Info;

  return (
    <div className="toast-enter fixed right-4 top-4 z-[70] max-w-[calc(100vw-2rem)]">
      <div
        role={type === "error" ? "alert" : "status"}
        aria-live={type === "error" ? "assertive" : "polite"}
        className={`flex min-w-64 items-center gap-2 rounded-xl px-4 py-3 shadow-lg ${styles[type] || styles.info}`}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span className="flex-1 text-sm font-medium">{message}</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-white/80 hover:bg-white/15 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;
