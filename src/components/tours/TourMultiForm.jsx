import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Save,
  X,
  Lightbulb,
  ChevronDown,
  MapPin,
  CalendarDays,
  Ticket,
  StickyNote,
  Paperclip,
} from "lucide-react";
import { AutocompleteInput, ProvincePicker } from "../common";
import { COMMON_PROVINCES } from "../../utils/provinces";
import { TOUR_TYPES } from "../../utils/tour-types";

// Shared grid template so the header and every row stay aligned
const ROW_GRID =
  "grid grid-cols-[28px_minmax(0,1fr)_160px_96px_96px_64px] gap-2 items-center";

const TourMultiForm = ({
  onSubmit,
  loading = false,
  supplierId = null,
  initialTours = null,
  submitLabel = null,
}) => {
  const [tours, setTours] = useState([]);
  const [errors, setErrors] = useState({});
  // Which rows have their detail panel open, keyed by tour id
  const [expanded, setExpanded] = useState({});

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
      tour_type: "one_day_trip",
      destinations: [], // Single province kept in an array for the ProvincePicker; flattened to `destination` on submit
      departure_from: "", // Sales zone / pickup area (persisted)
      pier: "",
      adult_price: "",
      child_price: "",
      start_date: today.toISOString().split("T")[0], // YYYY-MM-DD format
      end_date: nextYear.toISOString().split("T")[0], // YYYY-MM-DD format
      no_end_date: false, // New field for optional end date
      notes: "",
      park_fee_included: false,
      park_fee_adult: "", // Park fee per adult
      park_fee_child: "", // Park fee per child
      map_url: "",
      brochureFiles: [], // Our brochure - staged File objects (uploaded after tour is created)
      supplierBrochureFiles: [], // Supplier brochure - staged File objects
      galleryFiles: [], // Images - staged File objects
    };
  };

  // Add new tour (copy from previous if exists)
  const addTour = () => {
    const newTour = createEmptyTour();

    // Phase 4: Copy from previous tour (if exists)
    if (tours.length > 0) {
      const lastTour = tours[tours.length - 1];
      // Copy all fields except ID and staged files (files are tour-specific)
      Object.keys(newTour).forEach((key) => {
        if (
          key !== "id" &&
          key !== "brochureFiles" &&
          key !== "supplierBrochureFiles" &&
          key !== "galleryFiles"
        ) {
          newTour[key] = lastTour[key];
        }
      });
      // Clone array fields so siblings don't share the same reference
      newTour.destinations = [...(lastTour.destinations || [])];
    }

    setTours((prev) => [...prev, newTour]);
  };

  // Remove tour
  const removeTour = (tourId) => {
    if (tours.length <= 1) {
      alert("At least 1 tour is required");
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

  // Toggle a row's detail panel
  const toggleExpand = (tourId) => {
    setExpanded((prev) => ({ ...prev, [tourId]: !prev[tourId] }));
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

  // Add staged files to a tour (brochureFiles | galleryFiles)
  const addFiles = (tourId, field, fileList) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;
    setTours((prev) =>
      prev.map((tour) =>
        tour.id === tourId
          ? { ...tour, [field]: [...tour[field], ...files] }
          : tour
      )
    );
  };

  // Remove a single staged file by index
  const removeFile = (tourId, field, index) => {
    setTours((prev) =>
      prev.map((tour) =>
        tour.id === tourId
          ? { ...tour, [field]: tour[field].filter((_, i) => i !== index) }
          : tour
      )
    );
  };

  // Count of optional detail items filled, shown as a hint on the row
  const detailCount = (tour) => {
    let n = 0;
    if (tour.departure_from) n++;
    if (tour.pier) n++;
    if (tour.destinations.length) n++;
    if (tour.map_url) n++;
    if (tour.notes) n++;
    const files =
      tour.brochureFiles.length +
      tour.supplierBrochureFiles.length +
      tour.galleryFiles.length;
    if (files) n++;
    return n;
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
      tourErrors.tour_name = "Please enter a tour name";
    }

    // Validate dates only if end date is specified
    if (!tour.no_end_date && tour.start_date && tour.end_date) {
      const startDate = new Date(tour.start_date);
      const endDate = new Date(tour.end_date);

      if (endDate <= startDate) {
        tourErrors.end_date = "End date must be later than start date";
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

    // Auto-open detail panels for rows whose error lives in the detail (dates)
    const toOpen = {};
    Object.entries(allErrors).forEach(([id, errs]) => {
      if (errs.end_date) toOpen[id] = true;
    });
    if (Object.keys(toOpen).length > 0) {
      setExpanded((prev) => ({ ...prev, ...toOpen }));
    }

    return !hasErrors;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateAllTours()) {
      alert("Please make sure all information is complete and correct");
      return;
    }

    // Prepare data for submission. Strip temporary ID and staged files;
    // flatten the destinations array down to a single `destination` string.
    const toursData = tours.map((tour) => {
      const tourData = { ...tour };
      delete tourData.id;
      delete tourData.brochureFiles;
      delete tourData.supplierBrochureFiles;
      delete tourData.galleryFiles;
      delete tourData.destinations;
      return {
        ...tourData,
        destination: tour.destinations?.[0] || null,
        adult_price: parseFloat(tourData.adult_price) || 0,
        child_price: parseFloat(tourData.child_price) || 0,
        // Send empty string when blank so the backend stores NULL instead of 0
        park_fee_adult: tourData.park_fee_adult === "" ? "" : parseFloat(tourData.park_fee_adult) || 0,
        park_fee_child: tourData.park_fee_child === "" ? "" : parseFloat(tourData.park_fee_child) || 0,
        // Pass no_end_date flag to backend
        end_date: tour.no_end_date ? null : tourData.end_date,
      };
    });

    // Staged files in the same order as toursData (uploaded after tours are created)
    const tourFiles = tours.map((tour) => ({
      brochure: tour.brochureFiles,
      brochure_supplier: tour.supplierBrochureFiles,
      gallery: tour.galleryFiles,
    }));

    onSubmit({
      supplier_id: supplierId,
      tours: toursData,
      tourFiles,
    });
  };

  const hasFieldError = (tourId, field) => !!errors[tourId]?.[field];

  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
  // Section heading base (color added per section). Color helps scan groups.
  const sectionHead =
    "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide mb-2";
  const sectionCard =
    "bg-white rounded-lg border border-gray-200 border-l-4 p-3 grid grid-cols-1 gap-x-4 gap-y-3";
  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const cellInput =
    "w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tours table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div
          className={`${ROW_GRID} px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500`}
        >
          <span className="text-center">#</span>
          <span>Tour name</span>
          <span>Type</span>
          <span>Adult ฿</span>
          <span>Child ฿</span>
          <span className="text-center">Edit</span>
        </div>

        {/* Rows */}
        {tours.map((tour, index) => (
          <div key={tour.id} className="border-b border-gray-100 last:border-0">
            {/* Inline core fields */}
            <div className={`${ROW_GRID} px-3 py-2 hover:bg-gray-50/60`}>
              <span className="text-center text-sm text-gray-400">
                {index + 1}
              </span>

              <input
                type="text"
                value={tour.tour_name}
                onChange={(e) =>
                  updateTour(tour.id, "tour_name", e.target.value)
                }
                placeholder="Tour name *"
                className={`${cellInput} ${
                  hasFieldError(tour.id, "tour_name")
                    ? "border-red-500 ring-1 ring-red-500"
                    : ""
                }`}
              />

              <select
                value={tour.tour_type}
                onChange={(e) =>
                  updateTour(tour.id, "tour_type", e.target.value)
                }
                className={cellInput}
              >
                {TOUR_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={tour.adult_price}
                onChange={(e) =>
                  updateTour(tour.id, "adult_price", e.target.value)
                }
                min="0"
                placeholder="0"
                className={`${cellInput} text-right`}
              />

              <input
                type="number"
                value={tour.child_price}
                onChange={(e) =>
                  updateTour(tour.id, "child_price", e.target.value)
                }
                min="0"
                placeholder="0"
                className={`${cellInput} text-right`}
              />

              <div className="flex items-center justify-center gap-0.5">
                <button
                  type="button"
                  onClick={() => toggleExpand(tour.id)}
                  className="relative p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                  title="More details"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      expanded[tour.id] ? "rotate-180" : ""
                    }`}
                  />
                  {!expanded[tour.id] && detailCount(tour) > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  )}
                </button>
                {tours.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTour(tour.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    title="Remove this tour"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Detail panel */}
            {expanded[tour.id] && (
              <div className="px-4 py-4 bg-gray-50 border-t border-gray-100 space-y-5">
                {/* Route & pickup */}
                <section>
                  <h5 className={`${sectionHead} text-blue-500`}>
                    <MapPin className="w-3.5 h-3.5" /> Route &amp; pickup
                  </h5>
                  <div className={`${sectionCard} border-l-blue-400 md:grid-cols-2`}>
                  {/* Departure from */}
                  <div>
                    <label className={labelClass}>
                      Departure from{" "}
                      <span className="font-normal text-gray-400">
                        — can be more than one
                      </span>
                    </label>
                    <ProvincePicker
                      multiple
                      quickPicks={COMMON_PROVINCES}
                      value={
                        tour.departure_from
                          ? tour.departure_from
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean)
                          : []
                      }
                      onChange={(arr) =>
                        updateTour(tour.id, "departure_from", arr.join(", "))
                      }
                      placeholder="Type a province"
                    />
                  </div>

                  {/* Destination (single province) */}
                  <div>
                    <label className={labelClass}>
                      Destination{" "}
                      <span className="font-normal text-gray-400">
                        — one province
                      </span>
                    </label>
                    <ProvincePicker
                      quickPicks={COMMON_PROVINCES}
                      value={tour.destinations[0] || ""}
                      onChange={(val) =>
                        updateTour(tour.id, "destinations", val ? [val] : [])
                      }
                      placeholder="Type a province"
                    />
                  </div>

                  {/* Pier */}
                  <div>
                    <label className={labelClass}>Pier</label>
                    <AutocompleteInput
                      type="pier"
                      value={tour.pier}
                      onChange={(value) => updateTour(tour.id, "pier", value)}
                      placeholder="Pier name"
                    />
                  </div>

                  {/* Map URL */}
                  <div>
                    <label className={labelClass}>Google Maps URL</label>
                    <input
                      type="url"
                      value={tour.map_url}
                      onChange={(e) =>
                        updateTour(tour.id, "map_url", e.target.value)
                      }
                      className={inputClass}
                      placeholder="https://maps.app.goo.gl/..."
                    />
                  </div>
                  </div>
                </section>

                {/* Schedule */}
                <section>
                  <h5 className={`${sectionHead} text-indigo-500`}>
                    <CalendarDays className="w-3.5 h-3.5" /> Schedule
                  </h5>
                  <div className={`${sectionCard} border-l-indigo-400 md:grid-cols-2`}>
                  {/* Start Date */}
                  <div>
                    <label className={labelClass}>Start date</label>
                    <input
                      type="date"
                      value={tour.start_date}
                      onChange={(e) =>
                        updateTour(tour.id, "start_date", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-gray-700">
                        End date
                      </label>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tour.no_end_date}
                          onChange={(e) =>
                            handleNoEndDateToggle(tour.id, e.target.checked)
                          }
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="ml-1.5 text-xs text-orange-700">
                          No end date
                        </span>
                      </label>
                    </div>
                    {!tour.no_end_date ? (
                      <input
                        type="date"
                        value={tour.end_date}
                        onChange={(e) =>
                          updateTour(tour.id, "end_date", e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          hasFieldError(tour.id, "end_date")
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                    ) : (
                      <input
                        type="text"
                        value="Not specified"
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-orange-50 text-orange-700 cursor-not-allowed"
                      />
                    )}
                    {hasFieldError(tour.id, "end_date") && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[tour.id].end_date}
                      </p>
                    )}
                  </div>
                  </div>
                </section>

                {/* Park fee */}
                <section>
                  <h5 className={`${sectionHead} text-amber-500`}>
                    <Ticket className="w-3.5 h-3.5" /> Park fee
                  </h5>
                  <div className={`${sectionCard} border-l-amber-400 md:grid-cols-3 md:items-end`}>
                  {/* Park fee — adult */}
                  <div>
                    <label className={labelClass}>
                      Park fee{" "}
                      <span className="font-normal text-gray-400">/ adult ฿</span>
                    </label>
                    <input
                      type="number"
                      value={tour.park_fee_adult}
                      onChange={(e) =>
                        updateTour(tour.id, "park_fee_adult", e.target.value)
                      }
                      min="0"
                      placeholder="0"
                      className={`${inputClass} text-right`}
                    />
                  </div>

                  {/* Park fee — child */}
                  <div>
                    <label className={labelClass}>
                      Park fee{" "}
                      <span className="font-normal text-gray-400">/ child ฿</span>
                    </label>
                    <input
                      type="number"
                      value={tour.park_fee_child}
                      onChange={(e) =>
                        updateTour(tour.id, "park_fee_child", e.target.value)
                      }
                      min="0"
                      placeholder="0"
                      className={`${inputClass} text-right`}
                    />
                  </div>

                  {/* Park fee included */}
                  <div className="flex items-center md:pb-2">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={tour.park_fee_included}
                        onChange={(e) =>
                          updateTour(
                            tour.id,
                            "park_fee_included",
                            e.target.checked
                          )
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Net price includes park fee
                      </span>
                    </label>
                  </div>
                  </div>
                </section>

                {/* Notes */}
                <section>
                  <h5 className={`${sectionHead} text-slate-500`}>
                    <StickyNote className="w-3.5 h-3.5" /> Notes
                  </h5>
                  <div className={`${sectionCard} border-l-slate-400`}>
                    <label className="sr-only">Notes specific to this tour</label>
                    <textarea
                      value={tour.notes}
                      onChange={(e) =>
                        updateTour(tour.id, "notes", e.target.value)
                      }
                      rows={2}
                      className={inputClass}
                      placeholder="Additional notes for this tour..."
                    />
                  </div>
                </section>

                {/* Attachments */}
                <section>
                  <h5 className={`${sectionHead} text-emerald-500`}>
                    <Paperclip className="w-3.5 h-3.5" /> Attachments
                  </h5>
                  <div className={`${sectionCard} border-l-emerald-400 md:grid-cols-3`}>
                    {/* Our Brochure */}
                    <div>
                      <label className={labelClass}>Our brochure</label>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                        onChange={(e) => {
                          addFiles(tour.id, "brochureFiles", e.target.files);
                          e.target.value = "";
                        }}
                        className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
                      />
                      {tour.brochureFiles.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {tour.brochureFiles.map((file, i) => (
                            <li
                              key={i}
                              className="flex items-center justify-between text-xs bg-green-50 border border-green-200 rounded px-2 py-1"
                            >
                              <span className="truncate">{file.name}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  removeFile(tour.id, "brochureFiles", i)
                                }
                                className="ml-2 text-red-600 hover:text-red-800 shrink-0"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Supplier Brochure */}
                    <div>
                      <label className={labelClass}>Supplier brochure</label>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                        onChange={(e) => {
                          addFiles(
                            tour.id,
                            "supplierBrochureFiles",
                            e.target.files
                          );
                          e.target.value = "";
                        }}
                        className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200"
                      />
                      {tour.supplierBrochureFiles.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {tour.supplierBrochureFiles.map((file, i) => (
                            <li
                              key={i}
                              className="flex items-center justify-between text-xs bg-amber-50 border border-amber-200 rounded px-2 py-1"
                            >
                              <span className="truncate">{file.name}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  removeFile(
                                    tour.id,
                                    "supplierBrochureFiles",
                                    i
                                  )
                                }
                                className="ml-2 text-red-600 hover:text-red-800 shrink-0"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Images / Gallery */}
                    <div>
                      <label className={labelClass}>Images</label>
                      <input
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.gif,.webp"
                        onChange={(e) => {
                          addFiles(tour.id, "galleryFiles", e.target.files);
                          e.target.value = "";
                        }}
                        className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                      />
                      {tour.galleryFiles.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {tour.galleryFiles.map((file, i) => (
                            <li
                              key={i}
                              className="flex items-center justify-between text-xs bg-blue-50 border border-blue-200 rounded px-2 py-1"
                            >
                              <span className="truncate">{file.name}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  removeFile(tour.id, "galleryFiles", i)
                                }
                                className="ml-2 text-red-600 hover:text-red-800 shrink-0"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Tour Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={addTour}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Add another tour</span>
        </button>
      </div>

      {/* Submit Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h4 className="font-medium text-gray-900">
              Ready to save {tours.length} tour{tours.length > 1 ? "s" : ""}
            </h4>
            {tours.length > 1 && (
              <p className="flex items-center gap-1.5 text-xs text-blue-600 mt-1">
                <Lightbulb className="w-3.5 h-3.5" />
                New rows copy all fields from the previous row
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || tours.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>
                  {submitLabel || `Save all tours (${tours.length})`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default TourMultiForm;
