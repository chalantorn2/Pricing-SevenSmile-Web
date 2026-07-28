import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Share2, X, AlertTriangle, Maximize2 } from "lucide-react";
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

  const isExpired =
    tour.end_date &&
    tour.end_date !== "0000-00-00" &&
    new Date(tour.end_date) < new Date();

  // Share handler - open the share page in a new tab
  const handleShare = () => {
    const url = `${window.location.origin}/share/tour/${tour.id}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
  };

  // Edit handler - close the modal and go to the edit page
  const handleEdit = () => {
    onClose?.();
    // Navigation is handled by the Link component in TourDetails
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
          {/* Modal Header — title, badges, actions and close in one row */}
          <div className="sticky top-0 flex items-start gap-3 rounded-t-2xl border-b border-gray-200 bg-white px-6 py-4">
            <div className="min-w-0 flex-1">
              <h2
                id="tour-modal-title"
                className="truncate text-xl font-semibold text-gray-900"
                title={tour.tour_name}
              >
                {tour.tour_name || "Tour Details"}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {!!tour.pier && (
                  <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-700 ring-1 ring-inset ring-gray-200">
                    Pier: {tour.pier}
                  </span>
                )}
                {!!tour.departure_from && (
                  <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-700 ring-1 ring-inset ring-gray-200">
                    Departure from: {tour.departure_from}
                  </span>
                )}
                {!!tour.supplier_name && (
                  <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-700 ring-1 ring-inset ring-gray-200">
                    Supplier: {tour.supplier_name}
                  </span>
                )}
                {isExpired && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-danger-50 px-3 py-1 text-xs font-medium text-danger-700 ring-1 ring-inset ring-danger-200">
                    <AlertTriangle className="h-3 w-3" />
                    Expired
                  </span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                to={`/tour/${tour.id}`}
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[.98]"
                title="Open the full detail page"
              >
                <Maximize2 className="h-4 w-4" />
                Full page
              </Link>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[.98]"
                title="Open share page"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <Link
                to={`/edit/${tour.id}`}
                onClick={handleEdit}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 active:scale-[.98]"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
              <button
                ref={closeBtnRef}
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                title="Close"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
            <TourDetails
              tour={tour}
              showActions={false}
              showHeader={false}
              className="modal-tour-details"
            />
          </div>

          {/* Modal Footer */}
          <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[.98]"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {showToast && <Toast message="Share page opened" />}
    </>
  );
};

export default TourDetailsModal;
