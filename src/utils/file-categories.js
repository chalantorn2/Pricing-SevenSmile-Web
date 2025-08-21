// utils/file-categories.js
// File Categories Definition for Tour Management System

export const TOUR_FILE_CATEGORIES = {
  gallery: {
    id: "gallery",
    label: "🖼️ Gallery ทัวร์",
    description: "รูปภาพสถานที่ท่องเที่ยว, กิจกรรม, ทัวร์",
    allowedTypes: ["image"], // เฉพาะรูป
    examples: ["รูปเกาะ", "รูปกิจกรรม", "รูปโรงแรม"],
    color: "bg-blue-100 text-blue-700",
    icon: "🖼️",
  },
  brochure: {
    id: "brochure",
    label: "📋 Brochure",
    description: "ใบปลิว, แคตตาล็อก, รายละเอียดทัวร์",
    allowedTypes: ["pdf", "image"],
    examples: ["ใบปลิวทัวร์", "แคตตาล็อกโรงแรม", "รายการอาหาร"],
    color: "bg-green-100 text-green-700",
    icon: "📋",
  },
  itinerary: {
    id: "itinerary",
    label: "📅 Itinerary",
    description: "โปรแกรมทัวร์, กำหนดการ",
    allowedTypes: ["pdf", "image"],
    examples: ["โปรแกรม 3 วัน 2 คืน", "ตารางเดินทาง"],
    color: "bg-purple-100 text-purple-700",
    icon: "📅",
  },
  terms: {
    id: "terms",
    label: "📄 เงื่อนไข",
    description: "เงื่อนไขการจอง, ข้อตกลง",
    allowedTypes: ["pdf"],
    examples: ["เงื่อนไขการยกเลิก", "ข้อตกลงการจอง"],
    color: "bg-red-100 text-red-700",
    icon: "📄",
  },
  general: {
    id: "general",
    label: "📎 อื่นๆ",
    description: "ไฟล์ทั่วไป",
    allowedTypes: ["pdf", "image"],
    examples: ["เอกสารเพิ่มเติม"],
    color: "bg-gray-100 text-gray-700",
    icon: "📎",
  },
};

export const SUPPLIER_FILE_CATEGORIES = {
  contact_rate: {
    id: "contact_rate",
    label: "💰 Contact Rate",
    description: "ใบราคาจาก Supplier",
    allowedTypes: ["pdf", "image"],
    examples: ["ใบราคา Jan 2025", "Price List Update"],
    color: "bg-emerald-100 text-emerald-700",
    icon: "💰",
  },
  contract: {
    id: "contract",
    label: "📋 สัญญา/ข้อตกลง",
    description: "สัญญา, MOU, เงื่อนไขการทำงาน",
    allowedTypes: ["pdf"],
    examples: ["สัญญาความร่วมมือ", "เงื่อนไขการชำระ"],
    color: "bg-blue-100 text-blue-700",
    icon: "📋",
  },
  qr_code: {
    id: "qr_code",
    label: "📱 QR Code",
    description: "QR Code กลุ่ม Line, Social Media",
    allowedTypes: ["image"],
    examples: ["QR Code Line Group", "QR Code Facebook"],
    color: "bg-purple-100 text-purple-700",
    icon: "📱",
  },
  certificate: {
    id: "certificate",
    label: "🏆 ใบรับรอง",
    description: "ใบอนุญาต, ใบรับรอง, เอกสารทางกฎหมาย",
    allowedTypes: ["pdf", "image"],
    examples: ["ใบอนุญาตประกอบธุรกิจ", "TAT License"],
    color: "bg-yellow-100 text-yellow-700",
    icon: "🏆",
  },
  general: {
    id: "general",
    label: "📎 อื่นๆ",
    description: "เอกสารทั่วไป",
    allowedTypes: ["pdf", "image"],
    examples: ["เอกสารเพิ่มเติม"],
    color: "bg-gray-100 text-gray-700",
    icon: "📎",
  },
};

// Helper functions
export const getTourCategoryInfo = (categoryId) => {
  return TOUR_FILE_CATEGORIES[categoryId] || TOUR_FILE_CATEGORIES.general;
};

export const getSupplierCategoryInfo = (categoryId) => {
  return (
    SUPPLIER_FILE_CATEGORIES[categoryId] || SUPPLIER_FILE_CATEGORIES.general
  );
};

export const getTourCategoriesArray = () => {
  return Object.values(TOUR_FILE_CATEGORIES);
};

export const getSupplierCategoriesArray = () => {
  return Object.values(SUPPLIER_FILE_CATEGORIES);
};

export const isValidTourCategory = (categoryId) => {
  return Object.keys(TOUR_FILE_CATEGORIES).includes(categoryId);
};

export const isValidSupplierCategory = (categoryId) => {
  return Object.keys(SUPPLIER_FILE_CATEGORIES).includes(categoryId);
};

export const getCategoryHints = (categoryId, isSupplier = false) => {
  const categories = isSupplier
    ? SUPPLIER_FILE_CATEGORIES
    : TOUR_FILE_CATEGORIES;
  const category = categories[categoryId];

  if (!category) return null;

  return {
    description: category.description,
    examples: category.examples,
    allowedTypes: category.allowedTypes,
    allowedTypesText:
      category.allowedTypes.includes("image") &&
      category.allowedTypes.includes("pdf")
        ? "PDF และรูปภาพ"
        : category.allowedTypes.includes("pdf")
        ? "เฉพาะ PDF"
        : "เฉพาะรูปภาพ",
  };
};
