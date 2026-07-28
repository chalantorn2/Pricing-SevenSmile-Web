// Tour type options — shared across the add form, edit form, and detail view.
export const TOUR_TYPES = [
  { value: "one_day_trip", label: "One Day Trip" },
  { value: "private", label: "Private" },
  { value: "show_ticket", label: "Show / Ticket" },
  { value: "activity", label: "Activity" },
  { value: "package", label: "Package" },
];

// Human-readable label for a stored tour_type value (falls back to the raw value).
export const getTourTypeLabel = (value) =>
  TOUR_TYPES.find((t) => t.value === value)?.label || value || "";
