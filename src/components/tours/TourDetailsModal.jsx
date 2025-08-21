import { useEffect, useRef, useState } from "react";
import { Toast } from "../core";
import TourDetails from "./TourDetails";

const TourDetailsModal = ({ isOpen, onClose, tour }) => {
  const [showToast, setShowToast] = useState(false);
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);

  // A11y & UX
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !tour) return null;

  // Share handler - เปิดหน้าแชร์ในแท็บใหม่
  const handleShare = () => {
    const url = `${window.location.origin}/share/tour/${tour.id}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
  };

  // Edit handler - ปิด modal และไปหน้า edit
  const handleEdit = () => {
    onClose?.();
    // Navigation จะถูกจัดการโดย Link component ใน TourDetails
  };

  const handleBackdropClick = (e) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target)) {
      onClose?.();
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onMouseDown={handleBackdropClick}
        aria-labelledby="tour-modal-title"
        aria-modal="true"
        role="dialog"
      >
        <div
          ref={dialogRef}
          className="mx-4 w-full max-w-4xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="sticky top-0 flex items-center justify-end gap-3 border-b border-gray-200 px-6 py-4">
            <button
              ref={closeBtnRef}
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="ปิด"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="sr-only">ปิด</span>
            </button>
          </div>

          {/* Modal Content */}
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
            <TourDetails
              tour={tour}
              showActions={true}
              onShare={handleShare}
              onEdit={handleEdit}
              showHeader={true}
              className="modal-tour-details"
            />
          </div>

          {/* Modal Footer */}
          <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[.98]"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>

      {showToast && <Toast message="เปิดหน้าแชร์แล้ว" />}
    </>
  );
};

export default TourDetailsModal;
