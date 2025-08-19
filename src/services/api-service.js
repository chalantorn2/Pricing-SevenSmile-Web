// API Service for MariaDB via PHP - Updated for Suppliers
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  };

  // Debug logging
  console.log("🔗 API Call:", url);
  console.log("📝 Config:", config);

  try {
    const response = await fetch(url, config);

    // Debug response
    console.log("📡 Response Status:", response.status);
    console.log("📡 Response OK:", response.ok);

    const data = await response.json();
    console.log("📊 Response Data:", data);

    if (!response.ok) {
      console.error("❌ HTTP Error:", response.status, data);
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    // ตรวจสอบ response format ใหม่
    if (data.success === false) {
      console.error("❌ API Error:", data.error);
      throw new Error(data.error || "API Error");
    }

    return data;
  } catch (error) {
    console.error("💥 API Call Failed:", error);

    // ถ้าเป็น network error ให้แสดงข้อความที่เป็นประโยชน์
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error(
        `ไม่สามารถเชื่อมต่อกับ API ได้: ${url}\nกรุณาตรวจสอบ:\n1. URL ใน .env ถูกต้องหรือไม่\n2. API Server ทำงานอยู่หรือไม่\n3. CORS settings`
      );
    }

    throw error;
  }
}

// Authentication functions (unchanged)
export const authService = {
  // Login
  async login(username, password) {
    try {
      console.log("🔐 Attempting login for:", username);
      const response = await apiCall("/auth.php", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      // เก็บข้อมูล user ใน localStorage
      const userData = {
        id: response.data.id,
        username: response.data.username,
        role: response.data.role,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      console.log("✅ Login successful:", userData);
      return userData;
    } catch (error) {
      console.error("❌ Login failed:", error);
      throw error;
    }
  },

  // Logout
  logout() {
    localStorage.removeItem("user");
    console.log("👋 User logged out");
  },

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem("user");
    const userData = user ? JSON.parse(user) : null;
    console.log("👤 Current user:", userData);
    return userData;
  },

  // Check if user is admin
  isAdmin() {
    const user = this.getCurrentUser();
    const isAdminUser = user && user.role === "admin";
    console.log("🔑 Is admin:", isAdminUser);
    return isAdminUser;
  },
};

// ✨ NEW: Suppliers CRUD functions
export const suppliersService = {
  // Get all suppliers
  async getAllSuppliers() {
    try {
      console.log("🏢 Fetching all suppliers...");
      const response = await apiCall("/suppliers.php");
      console.log(
        "✅ Suppliers fetched successfully:",
        response.data?.length,
        "items"
      );
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch suppliers:", error);
      throw new Error(
        "เกิดข้อผิดพลาดในการโหลดข้อมูล Suppliers: " + error.message
      );
    }
  },

  // Search suppliers (for AutoComplete)
  async searchSuppliers(query) {
    try {
      console.log("🔍 Searching suppliers:", query);
      const response = await apiCall(
        `/suppliers.php?search=${encodeURIComponent(query)}`
      );
      console.log(
        "✅ Suppliers search results:",
        response.data?.length,
        "items"
      );
      return response.data || [];
    } catch (error) {
      console.error("❌ Failed to search suppliers:", error);
      throw new Error("เกิดข้อผิดพลาดในการค้นหา Suppliers: " + error.message);
    }
  },

  // Add new supplier
  async addSupplier(supplierData) {
    try {
      console.log("➕ Adding new supplier:", supplierData);
      const response = await apiCall("/suppliers.php", {
        method: "POST",
        body: JSON.stringify(supplierData),
      });
      console.log("✅ Supplier added successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to add supplier:", error);
      throw new Error("เกิดข้อผิดพลาดในการเพิ่ม Supplier: " + error.message);
    }
  },

  // Update supplier
  async updateSupplier(id, supplierData) {
    try {
      console.log("🔄 Updating supplier:", id, supplierData);
      const response = await apiCall(`/suppliers.php?id=${id}`, {
        method: "PUT",
        body: JSON.stringify(supplierData),
      });
      console.log("✅ Supplier updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to update supplier:", error);
      throw new Error("เกิดข้อผิดพลาดในการอัพเดท Supplier: " + error.message);
    }
  },

  // Delete supplier
  async deleteSupplier(id) {
    try {
      console.log("🗑️ Deleting supplier:", id);
      await apiCall(`/suppliers.php?id=${id}`, {
        method: "DELETE",
      });
      console.log("✅ Supplier deleted successfully");
    } catch (error) {
      console.error("❌ Failed to delete supplier:", error);
      throw new Error("เกิดข้อผิดพลาดในการลบ Supplier: " + error.message);
    }
  },

  async getSupplierById(id) {
    try {
      console.log("🏢 Fetching supplier by ID:", id);
      const response = await apiCall(`/suppliers.php?id=${id}`);
      console.log("✅ Supplier fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch supplier:", error);
      throw new Error(
        "เกิดข้อผิดพลาดในการโหลดข้อมูล Supplier: " + error.message
      );
    }
  },
};

// ✨ NEW: Supplier Files functions
export const supplierFilesService = {
  // Get files for a supplier
  async getSupplierFiles(supplierId) {
    try {
      console.log("📂 Fetching files for supplier:", supplierId);
      const response = await apiCall(
        `/supplier-files.php?supplier_id=${supplierId}`
      );
      console.log(
        "✅ Supplier files fetched successfully:",
        response.data?.length,
        "items"
      );
      return response.data || [];
    } catch (error) {
      console.error("❌ Failed to fetch supplier files:", error);
      throw new Error("เกิดข้อผิดพลาดในการโหลดไฟล์ Supplier: " + error.message);
    }
  },

  // Delete a supplier file
  async deleteSupplierFile(fileId) {
    try {
      console.log("🗑️ Deleting supplier file:", fileId);
      await apiCall(`/supplier-files.php?id=${fileId}`, {
        method: "DELETE",
      });
      console.log("✅ Supplier file deleted successfully");
    } catch (error) {
      console.error("❌ Failed to delete supplier file:", error);
      throw new Error("เกิดข้อผิดพลาดในการลบไฟล์: " + error.message);
    }
  },

  // Get file URL
  getSupplierFileUrl(file) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
    // เอา leading slash ออกจาก baseUrl ถ้ามี และรวม path ให้ถูกต้อง
    const cleanBaseUrl = baseUrl.replace(/\/$/, ""); // เอา trailing slash ออก
    const filePath = `${cleanBaseUrl}/${file.file_path}`;

    console.log("🔗 Generated supplier file URL:", filePath); // Debug log
    return filePath;
  },
};

// Updated Tours CRUD functions
export const toursService = {
  // Get all tours (now includes supplier info)
  async getAllTours() {
    try {
      console.log("🏝️ Fetching all tours...");
      const response = await apiCall("/tours.php");
      console.log(
        "✅ Tours fetched successfully:",
        response.data?.length,
        "items"
      );
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch tours:", error);
      throw new Error("เกิดข้อผิดพลาดในการโหลดข้อมูลทัวร์: " + error.message);
    }
  },

  async getTourById(id) {
    try {
      console.log("🏝️ Fetching tour by ID:", id);
      const response = await apiCall(`/tours.php?id=${id}`);
      console.log("✅ Tour fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch tour:", error);
      throw new Error("เกิดข้อผิดพลาดในการโหลดข้อมูลทัวร์: " + error.message);
    }
  },

  // Add new tour(s) - supports both single and multiple tours
  async addTours(tourData) {
    try {
      const user = authService.getCurrentUser();
      const dataWithUser = {
        ...tourData,
        updated_by: user?.username || "Unknown",
      };

      console.log("➕ Adding new tour(s):", dataWithUser);
      const response = await apiCall("/tours.php", {
        method: "POST",
        body: JSON.stringify(dataWithUser),
      });

      console.log("✅ Tour(s) added successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to add tour(s):", error);
      throw new Error("เกิดข้อผิดพลาดในการเพิ่มทัวร์: " + error.message);
    }
  },

  // Add single tour (backward compatibility)
  async addTour(tourData) {
    return this.addTours(tourData);
  },

  // Update tour
  async updateTour(id, tourData) {
    try {
      const user = authService.getCurrentUser();
      const dataWithUser = {
        ...tourData,
        updated_by: user?.username || "Unknown",
      };

      console.log("🔄 Updating tour:", id, dataWithUser);
      const response = await apiCall(`/tours.php?id=${id}`, {
        method: "PUT",
        body: JSON.stringify(dataWithUser),
      });

      console.log("✅ Tour updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to update tour:", error);
      throw new Error("เกิดข้อผิดพลาดในการอัพเดททัวร์: " + error.message);
    }
  },

  // Delete tour
  async deleteTour(id) {
    try {
      console.log("🗑️ Deleting tour:", id);
      await apiCall(`/tours.php?id=${id}`, {
        method: "DELETE",
      });
      console.log("✅ Tour deleted successfully");
    } catch (error) {
      console.error("❌ Failed to delete tour:", error);
      throw new Error("เกิดข้อผิดพลาดในการลบทัวร์: " + error.message);
    }
  },
};

// Users management functions (unchanged)
export const usersService = {
  // Get all users
  async getAllUsers() {
    try {
      console.log("👥 Fetching all users...");
      const response = await apiCall("/users.php");
      console.log(
        "✅ Users fetched successfully:",
        response.data?.length,
        "items"
      );
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch users:", error);
      throw new Error("เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้: " + error.message);
    }
  },

  // Add new user
  async addUser(userData) {
    try {
      console.log("👤➕ Adding new user:", userData);
      const response = await apiCall("/users.php", {
        method: "POST",
        body: JSON.stringify(userData),
      });
      console.log("✅ User added successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to add user:", error);
      throw error; // Pass through the original error message
    }
  },

  // Update user
  async updateUser(id, userData) {
    try {
      console.log("👤🔄 Updating user:", id, userData);
      const response = await apiCall(`/users.php?id=${id}`, {
        method: "PUT",
        body: JSON.stringify(userData),
      });
      console.log("✅ User updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to update user:", error);
      throw error; // Pass through the original error message
    }
  },

  // Delete user
  async deleteUser(id) {
    try {
      console.log("👤🗑️ Deleting user:", id);
      await apiCall(`/users.php?id=${id}`, {
        method: "DELETE",
      });
      console.log("✅ User deleted successfully");
    } catch (error) {
      console.error("❌ Failed to delete user:", error);
      throw new Error("เกิดข้อผิดพลาดในการลบผู้ใช้: " + error.message);
    }
  },
};

// Tour Files functions (unchanged)
export const filesService = {
  // Get files for a tour
  async getTourFiles(tourId) {
    try {
      console.log("📂 Fetching files for tour:", tourId);
      const response = await apiCall(`/files.php?tour_id=${tourId}`);
      console.log(
        "✅ Files fetched successfully:",
        response.data?.length,
        "items"
      );
      return response.data || [];
    } catch (error) {
      console.error("❌ Failed to fetch files:", error);
      throw new Error("เกิดข้อผิดพลาดในการโหลดไฟล์: " + error.message);
    }
  },

  // Delete a file
  async deleteFile(fileId) {
    try {
      console.log("🗑️ Deleting file:", fileId);
      await apiCall(`/files.php?id=${fileId}`, {
        method: "DELETE",
      });
      console.log("✅ File deleted successfully");
    } catch (error) {
      console.error("❌ Failed to delete file:", error);
      throw new Error("เกิดข้อผิดพลาดในการลบไฟล์: " + error.message);
    }
  },

  // Get file URL
  getFileUrl(file) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
    // เอา leading slash ออกจาก baseUrl ถ้ามี และรวม path ให้ถูกต้อง
    const cleanBaseUrl = baseUrl.replace(/\/$/, ""); // เอา trailing slash ออก
    const filePath = `${cleanBaseUrl}/${file.file_path}`;

    console.log("🔗 Generated file URL:", filePath); // Debug log
    return filePath;
  },
};

// Test API connection
export const testConnection = async () => {
  try {
    console.log("🔍 Testing API connection...");
    console.log("🌐 API Base URL:", API_BASE_URL);

    await apiCall("/tours.php");
    console.log("✅ เชื่อมต่อ API สำเร็จ");
    return true;
  } catch (error) {
    console.error("❌ เชื่อมต่อ API ไม่สำเร็จ:", error.message);
    return false;
  }
};

// Autocomplete service
export const autocompleteService = {
  // Get autocomplete suggestions
  async getSuggestions(type, query) {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      console.log(`🔍 Fetching autocomplete for ${type}:`, query);
      const response = await apiCall(
        `/autocomplete.php?type=${encodeURIComponent(
          type
        )}&query=${encodeURIComponent(query)}`
      );
      console.log("✅ Autocomplete results:", response.data?.length, "items");
      return response.data || [];
    } catch (error) {
      console.error("❌ Failed to fetch autocomplete:", error);
      return []; // Return empty array on error, don't throw
    }
  },
};
