import { FILE_UPLOAD } from "./constants";

export const validateTour = (tour) => {
  const errors = {};

  if (!tour.tour_name?.trim()) {
    errors.tour_name = "Please enter a tour name";
  }

  return errors;
};

export const validateFile = (file) => {
  if (!file) {
    return "Please select a file";
  }

  if (file.size > FILE_UPLOAD.MAX_SIZE) {
    return "File size is too large (max 10MB)";
  }

  const fileExt = file.name.split(".").pop().toLowerCase();
  if (!FILE_UPLOAD.ALLOWED_TYPES.includes(fileExt)) {
    return "Only PDF and image files are supported";
  }

  return null;
};

export const validateSupplier = (supplier) => {
  const errors = {};

  if (!supplier.name?.trim()) {
    errors.name = "Please enter a Supplier name";
  }

  return errors;
};
