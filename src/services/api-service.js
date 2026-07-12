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

  console.log("🔗 API Call:", url);
  console.log("📝 Config:", config);

  try {
    const response = await fetch(url, config);
    console.log("📡 Response Status:", response.status);
    console.log("📡 Response OK:", response.ok);

    if (!response.ok) {
      const data = await response.json();
      console.error("❌ HTTP Error:", response.status, data);
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    // ✅ Add fallback for PHP warnings
    const text = await response.text();

    // Try to extract JSON from PHP warnings
    let jsonText = text;
    if (text.includes('{"')) {
      // Find the first JSON segment in the response
      const jsonStart = text.indexOf('{"');
      if (jsonStart !== -1) {
        jsonText = text.substring(jsonStart);
      }
    }

    let data;
    try {
      data = JSON.parse(jsonText);
    } catch (parseError) {
      console.error(
        "❌ JSON Parse Error. Raw response:",
        text.substring(0, 500)
      );

      // ✅ If parsing fails but status is 200, assume success
      if (response.status === 200) {
        console.log("⚠️ Assuming success despite parse error");
        return { success: true, data: null };
      }

      throw new Error("Invalid JSON response from server");
    }

    console.log("📊 Response Data:", data);

    if (data.success === false) {
      console.error("❌ API Error:", data.error);
      throw new Error(data.error || "API Error");
    }

    return data;
  } catch (error) {
    console.error("💥 API Call Failed:", error);
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

      // Store user data in localStorage
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
        "An error occurred while loading Suppliers: " + error.message
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
      throw new Error("An error occurred while searching Suppliers: " + error.message);
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
      throw new Error("An error occurred while adding Supplier: " + error.message);
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
      throw new Error("An error occurred while updating Supplier: " + error.message);
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
      throw new Error("An error occurred while deleting Supplier: " + error.message);
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
        "An error occurred while loading Supplier: " + error.message
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
      throw new Error("An error occurred while loading Supplier files: " + error.message);
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
      throw new Error("An error occurred while deleting the file: " + error.message);
    }
  },

  async getTourFilesByCategory(tourId, category) {
    try {
      console.log(`📁 Fetching tour files for category: ${category}`);
      const response = await apiCall(
        `/files.php?tour_id=${tourId}&category=${encodeURIComponent(category)}`
      );
      console.log(`✅ Category files fetched: ${response.data?.length} items`);
      return response.data || [];
    } catch (error) {
      console.error("❌ Failed to fetch category files:", error);
      throw new Error(
        "An error occurred while loading files by category: " + error.message
      );
    }
  },

  async getSupplierFilesByCategory(supplierId, category) {
    try {
      console.log(`📁 Fetching supplier files for category: ${category}`);
      const response = await apiCall(
        `/supplier-files.php?supplier_id=${supplierId}&category=${encodeURIComponent(
          category
        )}`
      );
      console.log(
        `✅ Supplier category files fetched: ${response.data?.length} items`
      );
      return response.data || [];
    } catch (error) {
      console.error("❌ Failed to fetch supplier category files:", error);
      throw new Error(
        "An error occurred while loading Supplier files by category: " + error.message
      );
    }
  },

  // Upload supplier file with category
  async uploadSupplierFile(
    supplierId,
    file,
    category = "general",
    label = "",
    uploadedBy = "Unknown"
  ) {
    try {
      console.log(`📤 Uploading supplier file to category: ${category}`);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("supplier_id", supplierId);
      formData.append("file_category", category);
      formData.append("label", label);
      formData.append("uploaded_by", uploadedBy);

      const response = await fetch(`${API_BASE_URL}/supplier-files.php`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Upload failed");
      }

      console.log("✅ Supplier file uploaded successfully");
      return result.data;
    } catch (error) {
      console.error("❌ Failed to upload supplier file:", error);
      throw new Error(
        "An error occurred while uploading Supplier file: " + error.message
      );
    }
  },

  // Get file URL
  getSupplierFileUrl(file) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
    // Remove the trailing slash from baseUrl when present and build the path correctly
    const cleanBaseUrl = baseUrl.replace(/\/$/, ""); // Remove trailing slash
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
      throw new Error("An error occurred while loading tours: " + error.message);
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
      throw new Error("An error occurred while loading tours: " + error.message);
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
      throw new Error("An error occurred while adding tours: " + error.message);
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
      throw new Error("An error occurred while updating the tour: " + error.message);
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
      throw new Error("An error occurred while deleting the tour: " + error.message);
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
      throw new Error("An error occurred while loading users: " + error.message);
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
      throw new Error("An error occurred while deleting the user: " + error.message);
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
      throw new Error("An error occurred while loading files: " + error.message);
    }
  },

  // Upload tour file with category
  async uploadTourFile(
    tourId,
    file,
    category = "general",
    uploadedBy = "Unknown"
  ) {
    try {
      console.log(`📤 Uploading tour file to category: ${category}`);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("tour_id", tourId);
      formData.append("file_category", category); // ⭐ Add this line
      formData.append("uploaded_by", uploadedBy);

      const response = await fetch(`${API_BASE_URL}/files.php`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Upload failed");
      }

      console.log("✅ Tour file uploaded successfully");
      return result.data;
    } catch (error) {
      console.error("❌ Failed to upload tour file:", error);
      throw new Error("An error occurred while uploading the file: " + error.message);
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
      throw new Error("An error occurred while deleting the file: " + error.message);
    }
  },

  // Get file URL
  getFileUrl(file) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");
    const filePath = `${cleanBaseUrl}/${file.file_path}`;
    // console.log("🔗 Generated file URL:", filePath);
    return filePath;
  },
  async searchToursWithGallery(searchTerm) {
    try {
      console.log("🔍 Searching tours with gallery:", searchTerm);
      const response = await apiCall(
        `/tours.php?search_gallery=${encodeURIComponent(searchTerm)}`
      );
      console.log(
        "✅ Tours with gallery found:",
        response.data?.length,
        "items"
      );
      return response.data || [];
    } catch (error) {
      console.error("❌ Failed to search tours with gallery:", error);
      throw new Error("An error occurred while searching tours: " + error.message);
    }
  },

  async shareGalleryFiles(sourceTourId, targetTourId) {
    try {
      console.log(
        "🔗 Sharing gallery files from",
        sourceTourId,
        "to",
        targetTourId
      );
      const response = await apiCall("/files.php?action=share_gallery", {
        method: "PUT",
        body: JSON.stringify({
          source_tour_id: sourceTourId,
          target_tour_id: targetTourId,
        }),
      });
      console.log(
        "✅ Gallery files shared successfully:",
        response.shared_count,
        "files"
      );
      return response;
    } catch (error) {
      console.error("❌ Failed to share gallery files:", error);
      throw new Error("An error occurred while sharing gallery images: " + error.message);
    }
  },

  async unshareGalleryFiles(sourceTourId, targetTourId) {
    try {
      console.log(
        "🔗 Unsharing gallery files from",
        sourceTourId,
        "to",
        targetTourId
      );
      const response = await apiCall("/files.php?action=unshare_gallery", {
        method: "PUT",
        body: JSON.stringify({
          source_tour_id: sourceTourId,
          target_tour_id: targetTourId,
        }),
      });
      console.log(
        "✅ Gallery files unshared successfully:",
        response.unshared_count,
        "files"
      );
      return response;
    } catch (error) {
      console.error("❌ Failed to unshare gallery files:", error);
      throw new Error(
        "An error occurred while unsharing gallery images: " + error.message
      );
    }
  },
  // Unshare single file
  async unshareSingleFile(fileId, targetTourId) {
    try {
      console.log(
        "🔗 Unsharing single file:",
        fileId,
        "from tour:",
        targetTourId
      );
      const response = await apiCall("/files.php?action=unshare_single_file", {
        method: "PUT",
        body: JSON.stringify({
          file_id: fileId,
          target_tour_id: targetTourId,
        }),
      });
      console.log("✅ Single file unshared successfully");
      return response;
    } catch (error) {
      console.error("❌ Failed to unshare single file:", error);
      throw new Error("An error occurred while unsharing the file: " + error.message);
    }
  },
};

// Test API connection
export const testConnection = async () => {
  try {
    console.log("🔍 Testing API connection...");
    console.log("🌐 API Base URL:", API_BASE_URL);

    await apiCall("/tours.php");
    console.log("✅ API connection successful");
    return true;
  } catch (error) {
    console.error("❌ API connection failed:", error.message);
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

// Package Tours service
export const packageToursService = {
  // Get all package tours
  async getAllPackages() {
    try {
      console.log("📦 Fetching all package tours...");
      const response = await apiCall("/packages.php");
      console.log(
        "✅ Package tours fetched successfully:",
        response.data?.length,
        "items"
      );
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch package tours:", error);
      throw new Error(
        "An error occurred while loading tour packages: " + error.message
      );
    }
  },

  // Get package tour by ID
  async getPackageById(id) {
    try {
      console.log("📦 Fetching package tour by ID:", id);
      const response = await apiCall(`/packages.php?id=${id}`);
      console.log("✅ Package tour fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch package tour:", error);
      throw new Error(
        "An error occurred while loading tour packages: " + error.message
      );
    }
  },

  // Create new package tour
  async createPackage(packageData) {
    try {
      const user = authService.getCurrentUser();
      const dataWithUser = {
        ...packageData,
        created_by: user?.id || null,
      };

      console.log("➕ Creating new package tour:", dataWithUser);
      const response = await apiCall("/packages.php", {
        method: "POST",
        body: JSON.stringify(dataWithUser),
      });

      console.log("✅ Package tour created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to create package tour:", error);
      throw new Error(
        "An error occurred while creating the tour package: " + error.message
      );
    }
  },

  // Update package tour
  async updatePackage(id, packageData) {
    try {
      console.log("🔄 Updating package tour:", id, packageData);
      const response = await apiCall(`/packages.php?id=${id}`, {
        method: "PUT",
        body: JSON.stringify(packageData),
      });

      console.log("✅ Package tour updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to update package tour:", error);
      throw new Error(
        "An error occurred while updating the tour package: " + error.message
      );
    }
  },

  // Delete package tour
  async deletePackage(id) {
    try {
      console.log("🗑️ Deleting package tour:", id);
      await apiCall(`/packages.php?id=${id}`, {
        method: "DELETE",
      });
      console.log("✅ Package tour deleted successfully");
    } catch (error) {
      console.error("❌ Failed to delete package tour:", error);
      throw new Error(
        "An error occurred while deleting the tour package: " + error.message
      );
    }
  },
};

export const hotelsService = {
  // Get hotels (stored in our DB, synced from indosmilesouthservices.com)
  async getAllHotels(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value);
        }
      });
      const query = params.toString();
      const response = await apiCall(`/hotels.php${query ? `?${query}` : ""}`);
      return response;
    } catch (error) {
      console.error("❌ Failed to fetch hotels:", error);
      throw new Error("An error occurred while loading hotels: " + error.message);
    }
  },

  // Get one hotel by slug
  async getHotelBySlug(slug) {
    try {
      const response = await apiCall(`/hotels.php?slug=${encodeURIComponent(slug)}`);
      return response.data;
    } catch (error) {
      console.error("❌ Failed to fetch hotel:", error);
      throw new Error("An error occurred while loading the hotel: " + error.message);
    }
  },

  // Pull/refresh hotels from indosmilesouthservices.com into our DB
  async syncHotels() {
    try {
      console.log("🔄 Syncing hotels from source...");
      const response = await apiCall("/hotels-sync.php", { method: "POST" });
      console.log("✅ Hotels synced:", response);
      return response;
    } catch (error) {
      console.error("❌ Failed to sync hotels:", error);
      throw new Error("An error occurred while syncing hotels: " + error.message);
    }
  },

  // Net rates + free-text conditions for one hotel (for the rate editor)
  async getHotelRates(hotelId) {
    try {
      const response = await apiCall(`/hotel-rates.php?hotel_id=${encodeURIComponent(hotelId)}`);
      return response.data; // { rates:[...], conditions:{...} }
    } catch (error) {
      console.error("❌ Failed to fetch hotel rates:", error);
      throw new Error("An error occurred while loading hotel rates: " + error.message);
    }
  },

  // Bulk replace all rates for a hotel (and optionally its conditions)
  async saveHotelRates(hotelId, rates, conditions) {
    try {
      const body = { hotel_id: hotelId, rates };
      if (conditions) body.conditions = conditions;
      const response = await apiCall("/hotel-rates.php", {
        method: "POST",
        body: JSON.stringify(body),
      });
      return response;
    } catch (error) {
      console.error("❌ Failed to save hotel rates:", error);
      throw new Error("An error occurred while saving hotel rates: " + error.message);
    }
  },

  // Stop Sale / Promotion notices for one hotel
  async getHotelNotices(hotelId) {
    try {
      const response = await apiCall(
        `/hotel-notices.php?hotel_id=${encodeURIComponent(hotelId)}`
      );
      return response.data || [];
    } catch (error) {
      console.error("❌ Failed to fetch hotel notices:", error);
      throw new Error("An error occurred while loading hotel notices: " + error.message);
    }
  },

  // Create one notice; returns the new id
  async createHotelNotice(hotelId, notice) {
    try {
      const response = await apiCall("/hotel-notices.php", {
        method: "POST",
        body: JSON.stringify({ hotel_id: hotelId, ...notice }),
      });
      return response.id;
    } catch (error) {
      console.error("❌ Failed to create hotel notice:", error);
      throw new Error("An error occurred while saving the notice: " + error.message);
    }
  },

  // Update one notice
  async updateHotelNotice(id, notice) {
    try {
      const response = await apiCall("/hotel-notices.php", {
        method: "PUT",
        body: JSON.stringify({ id, ...notice }),
      });
      return response;
    } catch (error) {
      console.error("❌ Failed to update hotel notice:", error);
      throw new Error("An error occurred while updating the notice: " + error.message);
    }
  },

  // Delete one notice
  async deleteHotelNotice(id) {
    try {
      await apiCall(`/hotel-notices.php?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("❌ Failed to delete hotel notice:", error);
      throw new Error("An error occurred while deleting the notice: " + error.message);
    }
  },
};
