export const isExpired = (endDate) => {
  // ถ้าไม่มี end_date หรือเป็น null ให้ถือว่าไม่หมดอายุ
  if (!endDate || endDate === "0000-00-00") {
    return false;
  }
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

  // ✨ เพิ่มเงื่อนไข: เฉพาะทัวร์ที่มี end_date เท่านั้นที่จะเช็คหมดอายุ
  if (
    tour.end_date &&
    tour.end_date !== "0000-00-00" &&
    isExpired(tour.end_date)
  ) {
    notes += " | ⚠️ หมดอายุแล้ว กรุณาต่ออายุ";
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
