import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication functions
export const authService = {
  // Login
  async login(username, password) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !data) {
      throw new Error("ไม่พบชื่อผู้ใช้");
    }

    // ในการใช้งานจริงควรใช้ bcrypt สำหรับเข้ารหัส password
    // ตอนนี้ใช้การเปรียบเทียบแบบธรรมดาก่อน
    if (data.password !== password) {
      throw new Error("รหัสผ่านไม่ถูกต้อง");
    }

    // เก็บข้อมูล user ใน localStorage
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: data.id,
        username: data.username,
        role: data.role,
      })
    );

    return data;
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
    const { data, error } = await supabase
      .from("tours")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Add new tour
  async addTour(tourData) {
    const user = authService.getCurrentUser();
    const { data, error } = await supabase
      .from("tours")
      .insert([
        {
          ...tourData,
          updated_by: user?.username || "Unknown",
        },
      ])
      .select();

    if (error) throw error;
    return data[0];
  },

  // Update tour
  async updateTour(id, tourData) {
    const user = authService.getCurrentUser();
    const { data, error } = await supabase
      .from("tours")
      .update({
        ...tourData,
        updated_by: user?.username || "Unknown",
      })
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0];
  },

  // Delete tour
  async deleteTour(id) {
    const { error } = await supabase.from("tours").delete().eq("id", id);

    if (error) throw error;
  },
};

// Users management functions (Admin only)
export const usersService = {
  // Get all users
  async getAllUsers() {
    const { data, error } = await supabase
      .from("users")
      .select("id, username, role, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Add new user
  async addUser(userData) {
    const { data, error } = await supabase
      .from("users")
      .insert([userData])
      .select("id, username, role, created_at");

    if (error) throw error;
    return data[0];
  },

  // Update user
  async updateUser(id, userData) {
    const { data, error } = await supabase
      .from("users")
      .update(userData)
      .eq("id", id)
      .select("id, username, role, created_at");

    if (error) throw error;
    return data[0];
  },

  // Delete user
  async deleteUser(id) {
    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) throw error;
  },
};
