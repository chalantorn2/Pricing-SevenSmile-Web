import { useState, useEffect } from "react";
import { usersService } from "../../services/api-service";
import { useAuth } from "../../hooks/useAuth";
import { ConfirmDialog, Toast } from "../../components/core";
import { useI18n } from "../../i18n";

const OFFICES = [
  { value: "sevensmile", label: "Seven Smile" },
  { value: "indosmile", label: "INDO Smile" },
  { value: "both", label: "Seven Smile + INDO Smile" },
];

const OFFICE_BADGE = {
  sevensmile: "bg-brand-100 text-brand-800",
  indosmile: "bg-warning-100 text-warning-800",
  both: "bg-success-100 text-success-800",
};

const officeLabel = (value) =>
  OFFICES.find((o) => o.value === value)?.label || "Seven Smile";

const emptyForm = {
  username: "",
  password: "",
  role: "user",
  full_name: "",
  nickname: "",
  office: "sevensmile",
  position: "",
};

const UserManagement = () => {
  const { t } = useI18n();
  const { user: currentUser, isAdmin } = useAuth();
  const canManage = isAdmin();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await usersService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("An error occurred while loading users");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    setFormData({
      username: user?.username || "",
      password: "",
      role: user?.role || "user",
      full_name: user?.full_name || "",
      nickname: user?.nickname || "",
      office: user?.office || "sevensmile",
      position: user?.position || "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData(emptyForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!formData.username.trim()) {
        alert("Please enter a username");
        return;
      }

      if (!editingUser && !formData.password.trim()) {
        alert("Please enter a password");
        return;
      }

      const submitData = {
        username: formData.username.trim(),
        role: formData.role,
        full_name: formData.full_name.trim(),
        nickname: formData.nickname.trim(),
        office: formData.office,
        position: formData.position.trim(),
      };

      // Only include password if it's provided (for new users or password changes)
      if (formData.password.trim()) {
        submitData.password = formData.password;
      }

      if (editingUser) {
        await usersService.updateUser(editingUser.id, submitData);
        alert("User updated successfully");
      } else {
        await usersService.addUser(submitData);
        alert("User added successfully");
      }

      handleCloseModal();
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      alert(error.message || "An error occurred while saving data");
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await usersService.deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      setToast({ type: "success", message: t("users.deleteSuccess") });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      setToast({ type: "error", message: error.message || t("common.deleteError") });
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const visibleUsers = canManage
    ? users || []
    : (users || []).filter((u) => String(u.id) === String(currentUser?.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {canManage ? "User Management" : "My User"}
        </h1>
        {canManage && (
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
          >
            Add New User
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Office
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visibleUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {user.username}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* Nickname first - that is what people go by here. */}
                    <div className="text-sm text-gray-900">
                      {user.nickname || user.full_name || "-"}
                    </div>
                    {user.nickname && user.full_name && (
                      <div className="text-xs text-gray-500">
                        {user.full_name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        OFFICE_BADGE[user.office] || OFFICE_BADGE.sevensmile
                      }`}
                    >
                      {officeLabel(user.office)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {user.position || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === "admin"
                          ? "bg-danger-100 text-danger-800"
                          : "bg-success-100 text-success-800"
                      }`}
                    >
                      {user.role === "admin" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleOpenModal(user)}
                      className="text-brand-600 hover:text-brand-800 transition-colors"
                    >
                      Edit
                    </button>
                    {canManage && user.username !== "admin" && (
                      <button
                        onClick={() => setDeleteTarget(user)}
                        className="text-danger-600 hover:text-danger-800 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {visibleUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {!canManage
                  ? "Change Password"
                  : editingUser
                  ? "Edit User"
                  : "Add New User"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username <span className="text-danger-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    readOnly={!canManage}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                      !canManage ? "bg-gray-100 text-gray-500" : ""
                    }`}
                    placeholder="Enter username"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nickname
                    </label>
                    <input
                      type="text"
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleChange}
                      readOnly={!canManage}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                        !canManage ? "bg-gray-100 text-gray-500" : ""
                      }`}
                      placeholder="e.g. Nui"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      readOnly={!canManage}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                        !canManage ? "bg-gray-100 text-gray-500" : ""
                      }`}
                      placeholder="e.g. Somchai Jaidee"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Office <span className="text-danger-600">*</span>
                  </label>
                  <select
                    name="office"
                    value={formData.office}
                    onChange={handleChange}
                    required
                    disabled={!canManage}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                      !canManage ? "bg-gray-100 text-gray-500" : ""
                    }`}
                  >
                    {OFFICES.map((office) => (
                      <option key={office.value} value={office.value}>
                        {office.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    readOnly={!canManage}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                      !canManage ? "bg-gray-100 text-gray-500" : ""
                    }`}
                    placeholder="e.g. GM, Sales Manager"
                  />
                  {canManage && (
                    <p className="text-xs text-gray-500 mt-1">
                      More than one position can be entered, separated by commas
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password{" "}
                    {editingUser ? "" : <span className="text-danger-600">*</span>}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!editingUser}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    placeholder={
                      editingUser
                        ? "Leave blank if unchanged"
                        : "Enter password"
                    }
                  />
                  {editingUser && (
                    <p className="text-xs text-gray-500 mt-1">
                      Leave blank if you do not want to change the password
                    </p>
                  )}
                </div>

                {canManage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role <span className="text-danger-600">*</span>
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-brand-600 text-white py-2 px-4 rounded-lg hover:bg-brand-700 transition-colors"
                  >
                    {editingUser ? "Update" : "Add User"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t("users.deleteTitle")}
        description={t("users.deleteDescription", { name: deleteTarget?.username || "" })}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        busy={deleting}
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteTarget(null)}
      />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default UserManagement;
