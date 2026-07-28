import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { packageToursService, toursService } from "../../services/api-service";

const TIME_SLOTS = [
  { key: "breakfast", label: "Breakfast" },
  { key: "morning_tour", label: "Day Tour" },
  { key: "lunch", label: "Lunch" },
  { key: "evening_tour", label: "Evening Tour" },
  { key: "dinner", label: "Dinner" },
  { key: "hotel", label: "Hotel" },
];

const PackageTourForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState(3);
  const [nights, setNights] = useState(2);
  const [items, setItems] = useState({});
  const [allTours, setAllTours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTours();
    if (isEditMode) {
      fetchPackageData();
    } else {
      initializeItems(days, nights);
    }
  }, [id]);

  const fetchTours = async () => {
    try {
      const data = await toursService.getAllTours();
      setAllTours(data);
    } catch (error) {
      console.error("Error fetching tours:", error);
    }
  };

  const fetchPackageData = async () => {
    try {
      setLoading(true);
      const data = await packageToursService.getPackageById(id);
      setName(data.name);
      setDescription(data.description || "");
      setDays(data.days);
      setNights(data.nights);

      const itemsMap = {};
      data.items.forEach((item) => {
        const key = `${item.day_number}-${item.time_slot}`;
        itemsMap[key] = {
          tour_id: item.tour_id,
          custom_name: item.custom_name,
          price: item.price,
          unit: item.unit,
          notes: item.notes,
        };
      });
      setItems(itemsMap);
    } catch (error) {
      console.error("Error fetching package:", error);
      alert("An error occurred while loading data");
    } finally {
      setLoading(false);
    }
  };

  const initializeItems = (numDays, numNights) => {
    const newItems = {};
    for (let day = 1; day <= numDays; day++) {
      TIME_SLOTS.forEach((slot) => {
        const key = `${day}-${slot.key}`;
        newItems[key] = {
          tour_id: null,
          custom_name: "",
          price: "",
          unit: "",
          notes: "",
        };
      });
    }
    setItems(newItems);
  };

  const handleDaysChange = (newDays) => {
    setDays(newDays);
    initializeItems(newDays, nights);
  };

  const handleNightsChange = (newNights) => {
    setNights(newNights);
  };

  const updateItem = (day, timeSlot, field, value) => {
    const key = `${day}-${timeSlot}`;
    setItems((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
        ...(field === "tour_id" && value ? { custom_name: "" } : {}),
      },
    }));
  };

  const getItemValue = (day, timeSlot, field) => {
    const key = `${day}-${timeSlot}`;
    return items[key]?.[field] || "";
  };

  const getSelectedTourName = (day, timeSlot) => {
    const tourId = getItemValue(day, timeSlot, "tour_id");
    if (!tourId) return "";
    const tour = allTours.find((t) => t.id === parseInt(tourId));
    return tour ? tour.tour_name : "";
  };

  const calculateTotalCost = () => {
    let total = 0;
    Object.values(items).forEach((item) => {
      const price = parseFloat(item.price) || 0;
      total += price;
    });
    return total;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter a package name");
      return;
    }

    try {
      setSaving(true);

      const itemsArray = [];
      for (let day = 1; day <= days; day++) {
        TIME_SLOTS.forEach((slot) => {
          const key = `${day}-${slot.key}`;
          const item = items[key];

          if (item && (item.tour_id || item.custom_name)) {
            itemsArray.push({
              day_number: day,
              time_slot: slot.key,
              tour_id: item.tour_id || null,
              custom_name: item.custom_name || null,
              price: parseFloat(item.price) || 0,
              unit: item.unit || null,
              notes: item.notes || null,
            });
          }
        });
      }

      const packageData = {
        name,
        description,
        days,
        nights,
        total_cost: calculateTotalCost(),
        items: itemsArray,
      };

      if (isEditMode) {
        await packageToursService.updatePackage(id, packageData);
        alert("Changes saved successfully");
      } else {
        await packageToursService.createPackage(packageData);
        alert("Package created successfully");
      }

      navigate("/packages");
    } catch (error) {
      console.error("Error saving package:", error);
      alert("An error occurred while saving data");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-3"></div>
          <p className="text-gray-500">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEditMode ? "Edit Tour Package" : "Create New Tour Package"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Set the daily details for this tour package
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/packages")}
          className="px-4 py-2 text-gray-500 hover:text-gray-900"
        >
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm ring-1 ring-black/5 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Package Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="e.g. Phuket Tour 3 Days 2 Nights"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Days *
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={days}
                  onChange={(e) => handleDaysChange(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nights *
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={nights}
                  onChange={(e) => handleNightsChange(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="Additional package details"
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <div className="text-sm text-gray-500">
              Total Cost:
            </div>
            <div className="text-lg font-bold text-success-700">
              THB {calculateTotalCost().toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Package Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm ring-1 ring-black/5 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Activity Schedule (Admin Mode)</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10">
                    Item / Day
                  </th>
                  {Array.from({ length: days }, (_, i) => i + 1).map((day) => (
                    <th
                      key={day}
                      className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700 min-w-[300px]"
                    >
                      Day {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot) => (
                  <tr key={slot.key} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-medium text-gray-700 bg-gray-50 sticky left-0 z-10">
                      {slot.label}
                    </td>
                    {Array.from({ length: days }, (_, i) => i + 1).map((day) => (
                      <td key={`${day}-${slot.key}`} className="border border-gray-300 px-3 py-3">
                        <div className="space-y-2">
                          {/* Select Tour or Custom */}
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              Select Tour
                            </label>
                            <select
                              value={getItemValue(day, slot.key, "tour_id")}
                              onChange={(e) =>
                                updateItem(day, slot.key, "tour_id", e.target.value)
                              }
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-brand-500"
                            >
                              <option value="">-- Select from database --</option>
                              {allTours.map((tour) => (
                                <option key={tour.id} value={tour.id}>
                                  {tour.tour_name}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Custom Name */}
                          {!getItemValue(day, slot.key, "tour_id") && (
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">
                                Or enter manually
                              </label>
                              <input
                                type="text"
                                value={getItemValue(day, slot.key, "custom_name")}
                                onChange={(e) =>
                                  updateItem(day, slot.key, "custom_name", e.target.value)
                                }
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-brand-500"
                                placeholder="Place / activity name"
                              />
                            </div>
                          )}

                          {/* Price */}
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              Price / Cost (HHB)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={getItemValue(day, slot.key, "price")}
                              onChange={(e) =>
                                updateItem(day, slot.key, "price", e.target.value)
                              }
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-brand-500"
                              placeholder="0.00"
                            />
                          </div>

                          {/* Unit */}
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              Unit
                            </label>
                            <input
                              type="text"
                              value={getItemValue(day, slot.key, "unit")}
                              onChange={(e) =>
                                updateItem(day, slot.key, "unit", e.target.value)
                              }
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-brand-500"
                              placeholder="e.g. person, day, group"
                            />
                          </div>

                          {/* Notes */}
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              Notes
                            </label>
                            <textarea
                              value={getItemValue(day, slot.key, "notes")}
                              onChange={(e) =>
                                updateItem(day, slot.key, "notes", e.target.value)
                              }
                              rows={2}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-brand-500"
                              placeholder="Additional details"
                            />
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="sticky bottom-0 bg-white p-4 rounded-xl shadow-lg ring-1 ring-black/5 flex gap-4 justify-end z-20">
          <button
            type="button"
            onClick={() => navigate("/packages")}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 active:scale-[.98]"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={saving}
          >
            {saving ? "Saving..." : isEditMode ? "Save Changes" : "Create Package"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PackageTourForm;
