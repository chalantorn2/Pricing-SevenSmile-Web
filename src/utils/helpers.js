export const isExpired = (endDate) => {
  return new Date(endDate) < new Date();
};

export const formatEndDate = (endDate) => {
  if (!endDate) {
    return "ไม่กำหนด";
  }
  return formatDate(endDate);
};

export const getNotesWithExpiry = (tour) => {
  let notes = tour.notes || "";

  if (tour.park_fee_included) {
    notes = "ราคา Net นี้ รวมค่าอุทยานแล้ว" + (notes ? ` | ${notes}` : "");
  } else {
    notes = "ราคา Net นี้ ยังไม่รวมค่าอุทยาน" + (notes ? ` | ${notes}` : "");
  }

  // Only check expiry if end_date exists
  if (tour.end_date && isExpired(tour.end_date)) {
    notes += " | ⚠️ หมดอายุแล้ว กรุณาต่ออายุ";
  } else if (!tour.end_date) {
    notes += " | ♾️ ใช้ได้ตลอด";
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
  } catch (err) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    return true;
  }
};
