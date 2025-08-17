import { FILE_UPLOAD } from "./constants";

export const validateTour = (tour) => {
  const errors = {};

  if (!tour.tour_name?.trim()) {
    errors.tour_name = "กรุณากรอกชื่อทัวร์";
  }

  return errors;
};

export const validateFile = (file) => {
  if (!file) {
    return "กรุณาเลือกไฟล์";
  }

  if (file.size > FILE_UPLOAD.MAX_SIZE) {
    return "ขนาดไฟล์ใหญ่เกินไป (สูงสุด 10MB)";
  }

  const fileExt = file.name.split(".").pop().toLowerCase();
  if (!FILE_UPLOAD.ALLOWED_TYPES.includes(fileExt)) {
    return "รองรับเฉพาะไฟล์ PDF และรูปภาพ";
  }

  return null;
};

export const validateSubAgent = (subAgent) => {
  const errors = {};

  if (!subAgent.name?.trim()) {
    errors.name = "กรุณากรอกชื่อ Sub Agent";
  }

  return errors;
};
