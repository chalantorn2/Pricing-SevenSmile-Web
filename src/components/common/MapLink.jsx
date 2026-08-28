import { useI18n } from "../../i18n";

const MapLink = ({ mapUrl, tourName, className = "" }) => {
  const { t } = useI18n();
  if (!mapUrl) return null;

  const handleMapClick = () => {
    window.open(mapUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleMapClick}
      className={`inline-flex items-center gap-2 px-3 py-2 bg-success-100 text-success-700 rounded-lg hover:bg-success-100 transition-colors text-sm ${className}`}
      title={t("common.viewMapTitle", { name: tourName || t("tour.thisTour") })}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      <span>{t("common.viewMap")}</span>
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    </button>
  );
};

export default MapLink;
