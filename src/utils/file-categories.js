// utils/file-categories.js
// File Categories Definition for Tour Management System (Updated)

export const TOUR_FILE_CATEGORIES = {
  gallery: {
    id: "gallery",
    label: "Tour Gallery",
    description: "Photos of attractions, activities, tours",
    allowedTypes: ["image"], // images only
    examples: ["Island photos", "Activity photos", "Hotel photos"],
    color: "bg-blue-100 text-blue-700",
    icon: "🖼️",
  },
  brochure: {
    id: "brochure",
    label: "Brochure",
    description: "Flyers, catalogs, tour details",
    allowedTypes: ["pdf", "image"],
    examples: ["Tour flyer", "Hotel catalog", "Menu"],
    color: "bg-green-100 text-green-700",
    icon: "📋",
  },
  general: {
    id: "general",
    label: "Other",
    description: "General files",
    allowedTypes: ["pdf", "image"],
    examples: ["Additional documents"],
    color: "bg-gray-100 text-gray-700",
    icon: "📎",
  },
};

export const SUPPLIER_FILE_CATEGORIES = {
  contact_rate: {
    id: "contact_rate",
    label: "Contact Rate",
    description: "Price list from Supplier",
    allowedTypes: ["pdf", "image"],
    examples: ["Price list Jan 2025", "Price List Update"],
    color: "bg-emerald-100 text-emerald-700",
    icon: "💰",
  },
  qr_code: {
    id: "qr_code",
    label: "QR Code",
    description: "QR Code for Line group, Social Media",
    allowedTypes: ["pdf", "image"],
    examples: ["QR Code Line Group", "QR Code Facebook"],
    color: "bg-purple-100 text-purple-700",
    icon: "📱",
  },
  general: {
    id: "general",
    label: "Other",
    description: "General documents",
    allowedTypes: ["pdf", "image"],
    examples: ["Additional documents"],
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
        ? "PDF and images"
        : category.allowedTypes.includes("pdf")
        ? "PDF only"
        : "Images only",
  };
};
