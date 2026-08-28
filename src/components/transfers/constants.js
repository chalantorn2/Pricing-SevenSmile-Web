// Lookup tables shared by the transfer forms and the Transfers screen. Kept out
// of formUi.jsx so that file exports components only and stays fast-refreshable.

// Route categories are the sections of a supplier's rate sheet. The order here is
// the order the Routes tab groups by, so it follows the sheet rather than the
// alphabet. `transfer` is the fallback for anything that does not fit a section.
export const ROUTE_CATEGORIES = [
  { value: "hotel_transfer", label: "Hotel transfer" },
  { value: "airport_transfer", label: "Airport transfer" },
  { value: "inter_province", label: "Inter-province" },
  { value: "move_hotel", label: "Move hotel" },
  { value: "city_tour", label: "City tour" },
  { value: "restaurant_roundtrip", label: "Restaurant round trip" },
  { value: "attraction_roundtrip", label: "Attraction round trip" },
  { value: "show_roundtrip_a", label: "Show round trip (venue A)" },
  { value: "show_roundtrip_b", label: "Show round trip (venue B)" },
  { value: "transfer", label: "Other" },
];

export const categoryLabel = (value) =>
  ROUTE_CATEGORIES.find((c) => c.value === value)?.label || value || "Other";

// Provinces offered in the location form. Starts with the sidebar's list so a
// new location can always be filed under a province that has a menu entry; the
// rest are places the rate sheets reach into but no menu entry exists for
// (Songkhla onwards come from Iyara Transport's Hat Yai and Surat Thani sheets).
export const PROVINCES = [
  "Krabi",
  "Phuket",
  "Phang Nga",
  "Samui",
  "Bangkok",
  "Hua Hin",
  "Trang",
  "Surat Thani",
  "Songkhla",
  "Satun",
  "Chumphon",
  "Nakhon Si Thammarat",
];
