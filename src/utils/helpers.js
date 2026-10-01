import { formatDate } from "./formatters";

// "2026-08-31" parsed by the Date constructor is UTC midnight, which is a
// different instant from the local day it names. Every expiry date in the app is
// a plain calendar day, so build it from its parts and keep it local.
const parseDay = (value) => {
  if (!value || value === "0000-00-00") return null;
  const [y, m, d] = String(value).slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

// end_date is the last day the price is still good for, so a tour ending today
// is not expired yet — it turns expired tomorrow.
export const isExpired = (endDate) => {
  const end = parseDay(endDate);
  if (!end) return false;
  return end < startOfToday();
};

// Whole days from today to end_date: 0 = expires today, negative = already gone,
// null = no end date on file.
export const daysUntilExpiry = (endDate) => {
  const end = parseDay(endDate);
  if (!end) return null;
  return Math.round((end - startOfToday()) / 86400000);
};

// Still valid, but close enough to the end that the price wants a look.
export const isExpiringSoon = (endDate, withinDays = 30) => {
  const days = daysUntilExpiry(endDate);
  return days !== null && days >= 0 && days <= withinDays;
};

export const formatEndDate = (endDate) => {
  if (!endDate) {
    return "Not specified";
  }
  return formatDate(endDate);
};

export const getNotesWithExpiry = (tour) => {
  let notes = tour.notes || "";

  if (tour.park_fee_included) {
    notes = "This Net price includes the park fee" + (notes ? ` | ${notes}` : "");
  } else {
    notes = "This Net price does not include the park fee" + (notes ? ` | ${notes}` : "");
  }

  // ✨ Only check expiry for tours that have an end_date
  if (
    tour.end_date &&
    tour.end_date !== "0000-00-00" &&
    isExpired(tour.end_date)
  ) {
    notes += " | ⚠️ Expired, please renew";
  }

  return notes;
};

export const getFileIcon = (fileType) => {
  switch (fileType) {
    case "pdf":
      return "📄";
    case "image":
      return "🖼️";
    default:
      return "📎";
  }
};

export const generateShareUrl = (tourId) => {
  return `${window.location.origin}/share/tour/${tourId}`;
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    return true;
  }
};

// Suppliers that are no longer used are switched off rather than deleted. MySQL
// hands the flag back as "0"/"1"; a row without it (before the column existed)
// counts as active. Tours carry the same flag as `supplier_active`.
export const isSupplierActive = (flag) => String(flag ?? "1") !== "0";
