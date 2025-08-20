import { useState, useEffect } from "react";
import { AutocompleteInput } from "../common";

const TourMultiForm = ({
  onSubmit,
  loading = false,
  supplierId = null,
  initialTours = null,
}) => {
  const [tours, setTours] = useState([]);
  const [errors, setErrors] = useState({});

  // Initialize with one empty tour or provided tours
  useEffect(() => {
    if (initialTours && initialTours.length > 0) {
      setTours(initialTours);
    } else {
      setTours([createEmptyTour()]);
    }
  }, [initialTours]);

  // Create empty tour template with default dates
  const createEmptyTour = () => {
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);

    return {
      id: Date.now() + Math.random(), // Temporary ID for tracking
      tour_name: "",
      departure_from: "",
      pier: "",
      adult_price: "",
      child_price: "",
      start_date: today.toISOString().split("T")[0], // YYYY-MM-DD format
      end_date: nextYear.toISOString().split("T")[0], // YYYY-MM-DD format
      no_end_date: false, // New field for optional end date
      notes: "",
      park_fee_included: false,
    };
  };

  // Add new tour (copy from previous if exists)
  const addTour = () => {
    const newTour = createEmptyTour();

    // Phase 4: Copy from previous tour (if exists)
    if (tours.length > 0) {
      const lastTour = tours[tours.length - 1];
      // Copy all fields except ID and tour_name
      Object.keys(newTour).forEach((key) => {
        if (key !== "id" && key !== "tour_name") {
          newTour[key] = lastTour[key];
        }
      });
    }

    setTours((prev) => [...prev, newTour]);
  };

  // Remove tour
  const removeTour = (tourId) => {
    if (tours.length <= 1) {
      alert("ต้องมีทัวร์อย่างน้อย 1 รายการ");
      return;
    }
    setTours((prev) => prev.filter((tour) => tour.id !== tourId));
    // Remove errors for this tour
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[tourId];
      return newErrors;
    });
  };

  // Update tour field
  const updateTour = (tourId, field, value) => {
    setTours((prev) =>
      prev.map((tour) =>
        tour.id === tourId ? { ...tour, [field]: value } : tour
      )
    );

    // Clear error for this field
    if (errors[tourId]?.[field]) {
      setErrors((prev) => ({
        ...prev,
        [tourId]: {
          ...prev[tourId],
          [field]: null,
        },
      }));
    }
  };

  // Handle no end date toggle
  const handleNoEndDateToggle = (tourId, checked) => {
    setTours((prev) =>
      prev.map((tour) => {
        if (tour.id === tourId) {
          const updatedTour = { ...tour, no_end_date: checked };
          // If enabling no_end_date, clear the end_date value
          if (checked) {
            updatedTour.end_date = "";
          } else {
            // If disabling, set default end date (1 year from start date or today)
            const startDate = tour.start_date
              ? new Date(tour.start_date)
              : new Date();
            const defaultEndDate = new Date(startDate);
            defaultEndDate.setFullYear(startDate.getFullYear() + 1);
            updatedTour.end_date = defaultEndDate.toISOString().split("T")[0];
          }
          return updatedTour;
        }
        return tour;
      })
    );
  };

  // Validate single tour
  const validateTour = (tour) => {
    const tourErrors = {};

    if (!tour.tour_name.trim()) {
      tourErrors.tour_name = "กรุณากรอกชื่อทัวร์";
    }

    // Validate dates only if end date is specified
    if (!tour.no_end_date && tour.start_date && tour.end_date) {
      const startDate = new Date(tour.start_date);
      const endDate = new Date(tour.end_date);

      if (endDate <= startDate) {
        tourErrors.end_date = "วันสิ้นสุดต้องมากกว่าวันเริ่มต้น";
      }
    }

    return tourErrors;
  };

  // Validate all tours
  const validateAllTours = () => {
    const allErrors = {};
    let hasErrors = false;

    tours.forEach((tour) => {
      const tourErrors = validateTour(tour);
      if (Object.keys(tourErrors).length > 0) {
        allErrors[tour.id] = tourErrors;
        hasErrors = true;
      }
    });

    setErrors(allErrors);
    return !hasErrors;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateAllTours()) {
      alert("กรุณาตรวจสอบข้อมูลให้ครบถ้วนและถูกต้อง");
      return;
    }

    // Prepare data for submission
    const toursData = tours.map((tour) => {
      const { id, ...tourData } = tour; // Remove temporary ID
      return {
        ...tourData,
        adult_price: parseFloat(tourData.adult_price) || 0,
        child_price: parseFloat(tourData.child_price) || 0,
        // Pass no_end_date flag to backend
        end_date: tour.no_end_date ? null : tourData.end_date,
      };
    });

    onSubmit({
      supplier_id: supplierId,
      tours: toursData,
    });
  };

  // Get error for specific field
  const getFieldError = (tourId, field) => {
    return errors[tourId]?.[field];
  };

  // Check if field has error
  const hasFieldError = (tourId, field) => {
    return !!getFieldError(tourId, field);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tours List */}
      <div className="space-y-6">
        {tours.map((tour, index) => (
          <div
            key={tour.id}
            className="bg-white border border-gray-200 rounded-lg p-6 relative"
          >
            {/* Tour Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                ทัวร์ที่ {index + 1}
                {index > 0 && (
                  <span className="ml-2 text-sm font-normal text-blue-600">
                    (คัดลอกจากทัวร์ก่อนหน้า)
                  </span>
                )}
              </h3>
              <div className="flex items-center space-x-2">
                {tours.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTour(tour.id)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="ลบทัวร์นี้"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Tour Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tour Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อทัวร์ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={tour.tour_name}
                  onChange={(e) =>
                    updateTour(tour.id, "tour_name", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    hasFieldError(tour.id, "tour_name")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="กรอกชื่อทัวร์"
                />
                {hasFieldError(tour.id, "tour_name") && (
                  <p className="text-red-500 text-xs mt-1">
                    {getFieldError(tour.id, "tour_name")}
                  </p>
                )}
              </div>

              {/* Departure From - with Autocomplete */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ออกจาก
                </label>
                <AutocompleteInput
                  type="departure_from"
                  value={tour.departure_from}
                  onChange={(value) =>
                    updateTour(tour.id, "departure_from", value)
                  }
                  placeholder="จังหวัด/สถานที่ออกเดินทาง"
                />
              </div>

              {/* Pier - with Autocomplete */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ท่าเรือ
                </label>
                <AutocompleteInput
                  type="pier"
                  value={tour.pier}
                  onChange={(value) => updateTour(tour.id, "pier", value)}
                  placeholder="ชื่อท่าเรือ"
                />
              </div>

              {/* Adult Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ราคาผู้ใหญ่ (บาท)
                </label>
                <input
                  type="number"
                  value={tour.adult_price}
                  onChange={(e) =>
                    updateTour(tour.id, "adult_price", e.target.value)
                  }
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Child Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ราคาเด็ก (บาท)
                </label>
                <input
                  type="number"
                  value={tour.child_price}
                  onChange={(e) =>
                    updateTour(tour.id, "child_price", e.target.value)
                  }
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  วันที่เริ่มต้น
                </label>
                <input
                  type="date"
                  value={tour.start_date}
                  onChange={(e) =>
                    updateTour(tour.id, "start_date", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* End Date - with Optional Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  วันที่สิ้นสุด
                </label>

                {/* End Date Input - conditionally shown */}
                {!tour.no_end_date && (
                  <input
                    type="date"
                    value={tour.end_date}
                    onChange={(e) =>
                      updateTour(tour.id, "end_date", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      hasFieldError(tour.id, "end_date")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                )}

                {/* No End Date Checkbox */}
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={tour.no_end_date}
                      onChange={(e) =>
                        handleNoEndDateToggle(tour.id, e.target.checked)
                      }
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-orange-700">
                      ไม่กำหนดวันสิ้นสุด (ใช้ไปจนกว่าจะมีการเปลี่ยนแปลง)
                    </span>
                  </label>
                </div>

                {/* End Date in Disabled State */}
                {tour.no_end_date && (
                  <input
                    type="text"
                    value="ไม่กำหนด"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-orange-50 text-orange-700 cursor-not-allowed"
                  />
                )}

                {hasFieldError(tour.id, "end_date") && (
                  <p className="text-red-500 text-xs mt-1">
                    {getFieldError(tour.id, "end_date")}
                  </p>
                )}
              </div>

              {/* Park Fee Included */}
              <div className="md:col-span-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={tour.park_fee_included}
                    onChange={(e) =>
                      updateTour(tour.id, "park_fee_included", e.target.checked)
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    ราคา Net นี้ รวมค่าอุทยานแล้ว
                  </span>
                </label>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หมายเหตุเฉพาะทัวร์นี้
                </label>
                <textarea
                  value={tour.notes}
                  onChange={(e) => updateTour(tour.id, "notes", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="หมายเหตุเพิ่มเติมสำหรับทัวร์นี้..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Tour Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={addTour}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>เพิ่มทัวร์อีก 1 รายการ</span>
        </button>
      </div>

      {/* Submit Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">
              พร้อมบันทึก {tours.length} ทัวร์
            </h4>
            <p className="text-sm text-gray-500 mt-1">
              ตรวจสอบข้อมูลให้ครบถ้วนก่อนบันทึก
            </p>
            {tours.length > 1 && (
              <p className="text-xs text-blue-600 mt-1">
                💡 Tip: ทัวร์ใหม่จะคัดลอกข้อมูลจากทัวร์ก่อนหน้าอัตโนมัติ
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || tours.length === 0}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>กำลังบันทึก...</span>
              </div>
            ) : (
              `💾 บันทึกทัวร์ทั้งหมด (${tours.length} รายการ)`
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default TourMultiForm;
