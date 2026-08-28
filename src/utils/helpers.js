import { formatDate } from "./formatters";

export const isExpired = (endDate) => {
  // If there is no end_date or it is null, treat as not expired
  if (!endDate || endDate === "0000-00-00") {
    return false;
  }
  return new Date(endDate) < new Date();
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
