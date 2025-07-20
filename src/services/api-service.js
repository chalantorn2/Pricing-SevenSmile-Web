// API Service for MariaDB via PHP
// แทนที่ supabase.js

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

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    // ตรวจสอบ response format ใหม่
    if (data.success === false) {
      throw new Error(data.error || "API Error");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Authentication functions
export const authService = {
  // Login
  async login(username, password) {
    try {
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
      return userData;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout() {
    localStorage.removeItem("user");
  },

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Check if user is admin
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === "admin";
  },
};

// Tours CRUD functions
export const toursService = {
  // Get all tours
  async getAllTours() {
    try {
      const response = await apiCall("/tours.php");
      return response.data; // Return เฉพาะ data array
    } catch (error) {
      throw new Error("เกิดข้อผิดพลาดในการโหลดข้อมูลทัวร์");
    }
  },

  // Add new tour
  async addTour(tourData) {
    try {
      const user = authService.getCurrentUser();
      const dataWithUser = {
        ...tourData,
        updated_by: user?.username || "Unknown",
      };

      const response = await apiCall("/tours.php", {
        method: "POST",
        body: JSON.stringify(dataWithUser),
      });

      return response.data; // Return เฉพาะ data object
    } catch (error) {
      throw new Error("เกิดข้อผิดพลาดในการเพิ่มทัวร์");
    }
  },

  // Update tour
  async updateTour(id, tourData) {
    try {
      const user = authService.getCurrentUser();
      const dataWithUser = {
        ...tourData,
        updated_by: user?.username || "Unknown",
      };

      const response = await apiCall(`/tours.php?id=${id}`, {
        method: "PUT",
        body: JSON.stringify(dataWithUser),
      });

      return response.data; // Return เฉพาะ data object
    } catch (error) {
      throw new Error("เกิดข้อผิดพลาดในการอัพเดททัวร์");
    }
  },

  // Delete tour
  async deleteTour(id) {
    try {
      await apiCall(`/tours.php?id=${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      throw new Error("เกิดข้อผิดพลาดในการลบทัวร์");
    }
  },
};

// Users management functions (Admin only)
export const usersService = {
  // Get all users
  async getAllUsers() {
    try {
      const response = await apiCall("/users.php");
      return response.data; // Return เฉพาะ data array
    } catch (error) {
      throw new Error("เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้");
    }
  },

  // Add new user
  async addUser(userData) {
    try {
      const response = await apiCall("/users.php", {
        method: "POST",
        body: JSON.stringify(userData),
      });
      return response.data; // Return เฉพาะ data object
    } catch (error) {
      throw error; // Pass through the original error message
    }
  },

  // Update user
  async updateUser(id, userData) {
    try {
      const response = await apiCall(`/users.php?id=${id}`, {
        method: "PUT",
        body: JSON.stringify(userData),
      });
      return response.data; // Return เฉพาะ data object
    } catch (error) {
      throw error; // Pass through the original error message
    }
  },

  // Delete user
  async deleteUser(id) {
    try {
      await apiCall(`/users.php?id=${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      throw new Error("เกิดข้อผิดพลาดในการลบผู้ใช้");
    }
  },
};

// Test API connection
export const testConnection = async () => {
  try {
    await apiCall("/tours.php");
    console.log("✅ เชื่อมต่อ API สำเร็จ");
    return true;
  } catch (error) {
    console.error("❌ เชื่อมต่อ API ไม่สำเร็จ:", error.message);
    return false;
  }
};
