export const FILE_TYPES = {
  PDF: "pdf",
  IMAGE: "image",
};

export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
};

export const API_ENDPOINTS = {
  AUTH: "/auth.php",
  TOURS: "/tours.php",
  SUB_AGENTS: "/suppliers.php",
  FILES: "/files.php",
  SUB_AGENT_FILES: "/supplier-files.php",
  USERS: "/users.php",
};

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024,
  ALLOWED_TYPES: ["pdf", "jpg", "jpeg", "png", "gif", "webp"],
};

export const MESSAGES = {
  SUCCESS: {
    TOUR_CREATED: "Tour created successfully",
    TOUR_UPDATED: "Tour updated successfully",
    TOUR_DELETED: "Tour deleted successfully",
    FILE_UPLOADED: "File uploaded successfully",
    FILE_DELETED: "File deleted successfully",
  },
  ERROR: {
    REQUIRED_FIELD: "Please fill in all required fields",
    FILE_TOO_LARGE: "File size is too large",
    INVALID_FILE_TYPE: "Only PDF and image files are supported",
  },
};
