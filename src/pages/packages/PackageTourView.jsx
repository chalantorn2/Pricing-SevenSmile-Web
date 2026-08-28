import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Coffee,
  Sunrise,
  Sunset,
  Utensils,
  UtensilsCrossed,
  Hotel,
} from "lucide-react";
import { packageToursService } from "../../services/api-service";
import { useI18n } from "../../i18n";

const TIME_SLOTS = [
  { key: "breakfast", labelKey: "packages.slot.breakfast", Icon: Coffee },
  { key: "morning_tour", labelKey: "packages.slot.dayTour", Icon: Sunrise },
  { key: "lunch", labelKey: "packages.slot.lunch", Icon: Utensils },
  { key: "evening_tour", labelKey: "packages.slot.eveningTour", Icon: Sunset },
  { key: "dinner", labelKey: "packages.slot.dinner", Icon: UtensilsCrossed },
  { key: "hotel", labelKey: "packages.slot.hotel", Icon: Hotel },
];

const PackageTourView = () => {
  const { t } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [itemsMap, setItemsMap] = useState({});

  useEffect(() => {
    fetchPackageData();
  }, [id]);

  const fetchPackageData = async () => {
    try {
      setLoading(true);
      const data = await packageToursService.getPackageById(id);
      setPackageData(data);

      const map = {};
      data.items.forEach((item) => {
        const key = `${item.day_number}-${item.time_slot}`;
        map[key] = item;
      });
      setItemsMap(map);
    } catch (error) {
      console.error("Error fetching package:", error);
      alert(t("packages.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const getItemForCell = (day, timeSlot) => {
    const key = `${day}-${timeSlot}`;
    return itemsMap[key];
  };

  const getDisplayName = (item) => {
    if (!item) return "-";
    if (item.tour_name) return item.tour_name;
    if (item.custom_name) return item.custom_name;
    return "-";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-3"></div>
          <p className="text-gray-500">{t("packages.loading")}</p>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t("packages.notFound")}</p>
        <button
          onClick={() => navigate("/packages")}
          className="mt-4 px-4 py-2 text-brand-600 hover:text-brand-700"
        >
          ← {t("common.back")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">
              {packageData.name}
            </h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success-100 text-success-800">
              {t("packages.customerView")}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {t("packages.duration", {
              days: packageData.days,
              nights: packageData.nights,
            })}
          </p>
          {packageData.description && (
            <p className="text-sm text-gray-500 mt-2">{packageData.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => navigate("/packages")}
          className="px-4 py-2 text-gray-500 hover:text-gray-900"
        >
          ← {t("common.back")}
        </button>
      </div>

      {/* Package Table - Customer View */}
      <div className="bg-white p-6 rounded-xl shadow-sm ring-1 ring-black/5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{t("packages.details")}</h2>
          <div className="text-xs text-gray-500 bg-success-50 px-3 py-1 rounded-full">
            {t("packages.customerViewHint")}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-brand-50 to-brand-50">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700 sticky left-0 bg-brand-50 z-10">
                  {t("packages.itemPerDay")}
                </th>
                {Array.from({ length: packageData.days }, (_, i) => i + 1).map((day) => (
                  <th
                    key={day}
                    className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700 min-w-[250px]"
                  >
                    {t("packages.dayNumber", { day })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((slot, slotIndex) => (
                <tr
                  key={slot.key}
                  className={`hover:bg-brand-50/50 transition ${
                    slotIndex % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                  }`}
                >
                  <td className="border border-gray-300 px-4 py-4 font-medium text-gray-700 bg-gray-100 sticky left-0 z-10">
                    <div className="flex items-center gap-2">
                      <slot.Icon className="w-4 h-4 text-brand-600" />
                      <span>{t(slot.labelKey)}</span>
                    </div>
                  </td>
                  {Array.from({ length: packageData.days }, (_, i) => i + 1).map((day) => {
                    const item = getItemForCell(day, slot.key);
                    const displayName = getDisplayName(item);
                    const hasContent = displayName !== "-";

                    return (
                      <td
                        key={`${day}-${slot.key}`}
                        className={`border border-gray-300 px-4 py-4 ${
                          hasContent ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        {hasContent ? (
                          <div className="space-y-2">
                            <div className="font-medium text-gray-900 leading-relaxed">
                              {displayName}
                            </div>
                            {item?.notes && (
                              <div className="text-xs text-gray-500 leading-relaxed border-l-2 border-brand-200 pl-2 mt-2">
                                {item.notes}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center text-gray-400 text-sm">-</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <button
          type="button"
          onClick={() => navigate(`/packages/edit/${id}`)}
          className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 active:scale-[.98]"
        >
          {t("packages.edit")}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="px-6 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 active:scale-[.98]"
        >
          {t("packages.printPdf")}
        </button>
      </div>
    </div>
  );
};

export default PackageTourView;
