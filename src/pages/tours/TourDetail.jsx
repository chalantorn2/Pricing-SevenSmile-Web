import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  Link2,
  Pencil,
  Paperclip,
  Share2,
} from "lucide-react";
import { toursService } from "../../services/api-service";
import { TourDetails } from "../../components/tours";
import { DocumentModal } from "../../components/common";
import { Toast } from "../../components/core";

const TourDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchTour();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchTour = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await toursService.getTourById(id);
      // Older backends answer ?id= with the full list, so narrow it here too
      const found = Array.isArray(data)
        ? data.find((t) => String(t.id) === String(id))
        : data;

      if (found) {
        setTour(found);
      } else {
        setError("The requested tour was not found");
      }
    } catch (err) {
      console.error("Error fetching tour:", err);
      setError("An error occurred while loading data");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 1500);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link copied");
    } catch {
      showToast("Unable to copy the link");
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/share/tour/${id}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-900 font-medium">Tour not found</p>
        <p className="text-sm text-gray-500 mt-1">{error}</p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-brand-600 hover:bg-brand-700 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to tour list
        </Link>
      </div>
    );
  }

  const isExpired =
    tour.end_date &&
    tour.end_date !== "0000-00-00" &&
    new Date(tour.end_date) < new Date();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1
            className="mt-2 text-2xl font-semibold text-gray-900"
            title={tour.tour_name}
          >
            {tour.tour_name || "Tour Details"}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {!!tour.supplier_name && (
              <Link
                to={`/suppliers/${tour.supplier_id}`}
                className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-100"
              >
                Supplier: {tour.supplier_name}
              </Link>
            )}
            {!!tour.departure_from && (
              <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-700 ring-1 ring-inset ring-gray-200">
                Departure from: {tour.departure_from}
              </span>
            )}
            {!!tour.pier && (
              <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-700 ring-1 ring-inset ring-gray-200">
                Pier: {tour.pier}
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

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[.98]"
            title="Copy the link to this page"
          >
            <Link2 className="h-4 w-4" />
            Copy link
          </button>
          <button
            onClick={() => setShowDocumentModal(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[.98]"
            title="View documents"
          >
            <Paperclip className="h-4 w-4" />
            Documents
          </button>
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
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 active:scale-[.98]"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <TourDetails tour={tour} showActions={false} showHeader={false} />
      </div>

      <DocumentModal
        isOpen={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        tour={tour}
      />

      {toast && <Toast message={toast} />}
    </div>
  );
};

export default TourDetail;
