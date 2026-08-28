// Shared chrome for the three transfer form modals. They are small enough that a
// full-page form would be overkill, but identical enough that repeating the shell
// in each file would not be. Lookup tables live in ./constants.

export const inputClass =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500";

export const Field = ({ label, required, hint, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
      {required && <span className="text-danger-600"> *</span>}
      {hint && <span className="text-gray-400 font-normal"> {hint}</span>}
    </label>
    {children}
  </div>
);

/**
 * Modal chrome shared by the location, vehicle and route forms: overlay, header,
 * scrolling body and a footer that shows the save error next to the buttons.
 * The form element lives here and is wired to the footer button by id, so the
 * body stays a plain list of fields.
 */
export const ModalShell = ({
  title,
  subtitle,
  formId,
  onSubmit,
  onClose,
  saving,
  error,
  saveLabel = "Save",
  width = "max-w-lg",
  children,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div
      className={`bg-white w-full ${width} max-h-[92vh] rounded-xl shadow-lg flex flex-col overflow-hidden`}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-danger-50 hover:text-danger-600 transition text-2xl leading-none"
        >
          &times;
        </button>
      </div>

      <form
        id={formId}
        onSubmit={onSubmit}
        className="flex-1 overflow-y-auto p-6 space-y-4"
      >
        {children}
      </form>

      <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50">
        <div className="text-sm text-danger-600">{error}</div>
        <div className="flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form={formId}
            disabled={saving}
            className="px-6 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : saveLabel}
          </button>
        </div>
      </div>
    </div>
  </div>
);
