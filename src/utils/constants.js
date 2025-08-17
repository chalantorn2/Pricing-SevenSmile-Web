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
  SUB_AGENTS: "/sub-agents.php",
  FILES: "/files.php",
  SUB_AGENT_FILES: "/sub-agent-files.php",
  USERS: "/users.php",
};

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024,
  ALLOWED_TYPES: ["pdf", "jpg", "jpeg", "png", "gif", "webp"],
};

export const MESSAGES = {
  SUCCESS: {
    TOUR_CREATED: "สร้างทัวร์สำเร็จ",
    TOUR_UPDATED: "อัปเดตทัวร์สำเร็จ",
    TOUR_DELETED: "ลบทัวร์สำเร็จ",
    FILE_UPLOADED: "อัพโหลดไฟล์สำเร็จ",
    FILE_DELETED: "ลบไฟล์สำเร็จ",
  },
  ERROR: {
    REQUIRED_FIELD: "กรุณากรอกข้อมูลให้ครบถ้วน",
    FILE_TOO_LARGE: "ขนาดไฟล์ใหญ่เกินไป",
    INVALID_FILE_TYPE: "รองรับเฉพาะไฟล์ PDF และรูปภาพ",
  },
};
