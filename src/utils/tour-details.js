// Option lists for the detail fields added to `tours` (duration, meals, vessel,
// pickup, operating days). Shared by the add form, the edit form and the detail
// view so a stored value always renders with the same label.
//
// The stored value is the `value` string; changing a label is safe, changing a
// value is a data migration.

export const DURATION_TYPES = [
  { value: "full_day", label: "Full day" },
  { value: "half_day_am", label: "Half day (morning)" },
  { value: "half_day_pm", label: "Half day (afternoon)" },
  { value: "multi_day", label: "Multi-day" },
  { value: "flexible", label: "Flexible" },
];

export const PRICE_MODES = [
  { value: "per_person", label: "Per person (adult / child)" },
  { value: "per_group", label: "Per group" },
  { value: "per_boat", label: "Per boat" },
  { value: "per_vehicle", label: "Per vehicle" },
];

// Only per_person splits the price into adult / child / infant.
export const isPerPersonPricing = (mode) => !mode || mode === "per_person";

export const MEALS = [
  { value: "breakfast", label: "Breakfast" },
  { value: "morning_snack", label: "Morning snack" },
  { value: "lunch", label: "Lunch" },
  { value: "afternoon_snack", label: "Afternoon snack" },
  { value: "dinner", label: "Dinner" },
  { value: "drinking_water", label: "Drinking water" },
  { value: "soft_drinks", label: "Soft drinks" },
];

export const MEAL_STYLES = [
  { value: "buffet", label: "Buffet" },
  { value: "set_menu", label: "Set menu" },
  { value: "box", label: "Lunch box" },
  { value: "onboard", label: "Served onboard" },
  { value: "none", label: "No meal" },
];

export const VESSEL_TYPES = [
  { value: "speedboat", label: "Speedboat" },
  { value: "catamaran", label: "Catamaran" },
  { value: "longtail", label: "Longtail boat" },
  { value: "big_boat", label: "Big boat" },
  { value: "ferry", label: "Ferry" },
  { value: "yacht", label: "Yacht" },
  { value: "van", label: "Van" },
  { value: "minibus", label: "Minibus" },
  { value: "bus", label: "Bus" },
  { value: "none", label: "No vessel / vehicle" },
];

export const TRANSFER_TYPES = [
  { value: "join", label: "Join (shared van)" },
  { value: "private", label: "Private transfer" },
  { value: "meet_on_site", label: "Meet on site" },
];

export const GUIDE_LANGUAGES = [
  { value: "th", label: "Thai" },
  { value: "en", label: "English" },
  { value: "zh", label: "Chinese" },
  { value: "ru", label: "Russian" },
  { value: "ko", label: "Korean" },
  { value: "de", label: "German" },
  { value: "fr", label: "French" },
];

// Monday-first, matching how a rate sheet is written.
export const WEEKDAYS = [
  { value: "mon", label: "Mon" },
  { value: "tue", label: "Tue" },
  { value: "wed", label: "Wed" },
  { value: "thu", label: "Thu" },
  { value: "fri", label: "Fri" },
  { value: "sat", label: "Sat" },
  { value: "sun", label: "Sun" },
];

/** Human-readable label for a stored value; falls back to the raw value. */
export const getLabel = (options, value) =>
  options.find((o) => o.value === value)?.label || value || "";

/**
 * Read a column stored as a JSON array. The DB holds JSON text, but a form that
 * has not been saved yet holds a real array, and old rows hold NULL — accept all
 * three and always return an array.
 */
export const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Tolerate a plain comma-separated list typed in by hand.
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
};

/** Toggle one value in an array field (meals, guide languages, operating days). */
export const toggleInArray = (list, value) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

/** Sort a set of day codes back into Mon..Sun order. */
export const sortDays = (days) =>
  WEEKDAYS.map((d) => d.value).filter((d) => days.includes(d));

/** "Every day", "Tue, Thu, Sun", or "" when nothing is recorded. */
export const formatOperatingDays = (value) => {
  const days = sortDays(toArray(value));
  if (days.length === 0) return "";
  if (days.length === 7) return "Every day";
  return days.map((d) => getLabel(WEEKDAYS, d)).join(", ");
};

/** "08:00 – 17:00", "From 08:00", "Until 17:00", or "". */
export const formatTimeRange = (from, to) => {
  const clean = (t) => (t ? String(t).slice(0, 5) : "");
  const a = clean(from);
  const b = clean(to);
  if (a && b) return `${a} – ${b}`;
  if (a) return `From ${a}`;
  if (b) return `Until ${b}`;
  return "";
};

/** "8 hrs" / "8.5 hrs" — trims the pointless .0 that DECIMAL(4,1) returns. */
export const formatHours = (hours) => {
  if (hours === null || hours === undefined || hours === "") return "";
  const n = Number(hours);
  if (Number.isNaN(n) || n <= 0) return "";
  return `${Number.isInteger(n) ? n : n.toFixed(1)} hrs`;
};

/** "4–11 yrs", "up to 11 yrs", "4 yrs and up", or "". */
export const formatAgeRange = (min, max) => {
  const lo = min === null || min === undefined || min === "" ? null : Number(min);
  const hi = max === null || max === undefined || max === "" ? null : Number(max);
  if (lo != null && hi != null) return `${lo}–${hi} yrs`;
  if (hi != null) return `up to ${hi} yrs`;
  if (lo != null) return `${lo} yrs and up`;
  return "";
};

/**
 * Tri-state flag (halal, guide, transfer): NULL means nobody has recorded it and
 * must not read as "no". Returns "Yes" | "No" | "" .
 */
export const formatTriState = (value) => {
  if (value === null || value === undefined || value === "") return "";
  return Number(value) === 1 ? "Yes" : "No";
};

// ---------------------------------------------------------------------------
// Form plumbing for the detail fields. Both the add form and the edit form use
// these so the two screens can never drift apart on defaults or parsing.
// ---------------------------------------------------------------------------

/** Detail fields stored as a JSON array. */
export const DETAIL_ARRAY_FIELDS = [
  "meals_included",
  "guide_languages",
  "operating_days",
];

/** A blank row: "" everywhere, which the API stores as NULL ("not recorded"). */
export const emptyDetailValues = () => ({
  duration_type: "",
  duration_hours: "",
  start_time: "",
  end_time: "",
  time_note: "",
  price_mode: "",
  child_age_min: "",
  child_age_max: "",
  infant_price: "",
  infant_age_max: "",
  single_supplement: "",
  min_pax: "",
  max_pax: "",
  meals_included: [],
  meal_style: "",
  meal_venue: "",
  halal_available: "",
  vegetarian_available: "",
  meal_note: "",
  vessel_type: "",
  vessel_name: "",
  vessel_capacity: "",
  vessel_detail: "",
  guide_included: "",
  guide_languages: [],
  transfer_included: "",
  transfer_type: "",
  pickup_time_from: "",
  pickup_time_to: "",
  meeting_point: "",
  operating_days: [],
  booking_lead_hours: "",
  last_verified_at: "",
  is_active: 1,
  is_frequent: 0,
});

const asText = (value) =>
  value === null || value === undefined ? "" : String(value);

// A DECIMAL comes back as "8.5" and an INT as "35"; drop a trailing .0 so the
// input doesn't show 8.0 for a tour that simply runs 8 hours.
const asNumberText = (value) => {
  if (value === null || value === undefined || value === "") return "";
  const n = Number(value);
  if (Number.isNaN(n)) return "";
  return String(n);
};

const asFlagText = (value) => {
  if (value === null || value === undefined || value === "") return "";
  return Number(value) === 1 ? "1" : "0";
};

const asTimeText = (value) => (value ? String(value).slice(0, 5) : "");

const asDateText = (value) =>
  !value || value === "0000-00-00" ? "" : String(value).slice(0, 10);

/** Turn a `tours` row from the API into form values for TourDetailFields. */
export const detailValuesFromRow = (row = {}) => ({
  duration_type: asText(row.duration_type),
  duration_hours: asNumberText(row.duration_hours),
  start_time: asTimeText(row.start_time),
  end_time: asTimeText(row.end_time),
  time_note: asText(row.time_note),
  price_mode: asText(row.price_mode),
  child_age_min: asNumberText(row.child_age_min),
  child_age_max: asNumberText(row.child_age_max),
  infant_price: asNumberText(row.infant_price),
  infant_age_max: asNumberText(row.infant_age_max),
  single_supplement: asNumberText(row.single_supplement),
  min_pax: asNumberText(row.min_pax),
  max_pax: asNumberText(row.max_pax),
  meals_included: toArray(row.meals_included),
  meal_style: asText(row.meal_style),
  meal_venue: asText(row.meal_venue),
  halal_available: asFlagText(row.halal_available),
  vegetarian_available: asFlagText(row.vegetarian_available),
  meal_note: asText(row.meal_note),
  vessel_type: asText(row.vessel_type),
  vessel_name: asText(row.vessel_name),
  vessel_capacity: asNumberText(row.vessel_capacity),
  vessel_detail: asText(row.vessel_detail),
  guide_included: asFlagText(row.guide_included),
  guide_languages: toArray(row.guide_languages),
  transfer_included: asFlagText(row.transfer_included),
  transfer_type: asText(row.transfer_type),
  pickup_time_from: asTimeText(row.pickup_time_from),
  pickup_time_to: asTimeText(row.pickup_time_to),
  meeting_point: asText(row.meeting_point),
  operating_days: sortDays(toArray(row.operating_days)),
  booking_lead_hours: asNumberText(row.booking_lead_hours),
  last_verified_at: asDateText(row.last_verified_at),
  // These two are NOT NULL in the database, so an older row still has 1 / 0.
  is_active: Number(row.is_active) === 0 ? 0 : 1,
  is_frequent: Number(row.is_frequent) === 1 ? 1 : 0,
});
