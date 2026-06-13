import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAppSelector } from "../store/hooks";

type UserRole = "user" | "creator" | "admin";

interface AdminUser {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
}

const AdminUsersPage = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, UserRole>>({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "", role: "user" as UserRole });
  const currentUser = useAppSelector((state) => state.user.user);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const response = await axiosInstance.get<{ users: AdminUser[]; pagination: { page: number; pages: number } }>(`/auth/users?${params}`);
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.pages);
      const initialRoles: Record<string, UserRole> = {};
      response.data.users.forEach((item) => {
        initialRoles[item._id] = item.role;
      });
      setSelectedRoles(initialRoles);
    } catch (err: any) {
      setError(err.response?.data?.message || "לא ניתן לטעון את המשתמשים");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, page]);

  const handleRoleChange = (userId: string, role: UserRole) => {
    setSelectedRoles((prev) => ({ ...prev, [userId]: role }));
  };

  const handleSaveRole = async (userId: string) => {
    const newRole = selectedRoles[userId];
    if (!newRole) return;

    setUpdatingUserId(userId);
    setError(null);

    try {
      await axiosInstance.put(`/auth/users/${userId}`, { role: newRole });
      setUsers((prev) => prev.map((item) => (item._id === userId ? { ...item, role: newRole } : item)));
    } catch (err: any) {
      setError(err.response?.data?.message || "עדכון תפקיד נכשל");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      setError("לא ניתן למחוק את עצמך");
      return;
    }

    const confirmed = window.confirm("האם ברצונך למחוק את המשתמש הזה?");
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      await axiosInstance.delete(`/auth/users/${userId}`);
      setUsers((prev) => prev.filter((item) => item._id !== userId));
    } catch (err: any) {
      setError(err.response?.data?.message || "מחיקת המשתמש נכשלה");
    } finally {
      setLoading(false);
    }
  };

  const handleNewUserChange = (field: string, value: string) => {
    setNewUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      setError("יש להשלים שם משתמש, אימייל וסיסמה");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axiosInstance.post("/auth/users", newUser);
      setNewUser({ username: "", email: "", password: "", role: "user" });
      setPage(1);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || "יצירת המשתמש נכשלה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-users-container">
      <div className="admin-users-header">
        <h1>ניהול משתמשים</h1>
        <p>כאן המנהל יכול לצפות בכל המשתמשים, לחפש, לערוך תפקידים ולמחוק משתמשים.</p>
      </div>

      <div className="admin-users-controls">
        <div className="search-group">
          <input
            type="text"
            placeholder="חפש משתמש לפי שם או אימייל"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="new-user-card">
          <h2>הוסף משתמש חדש</h2>
          <div className="form-group">
            <label>שם משתמש</label>
            <input
              type="text"
              value={newUser.username}
              onChange={(e) => handleNewUserChange("username", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>אימייל</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => handleNewUserChange("email", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>סיסמה</label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => handleNewUserChange("password", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>תפקיד</label>
            <select value={newUser.role} onChange={(e) => handleNewUserChange("role", e.target.value)}>
              <option value="user">user</option>
              <option value="creator">creator</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <button className="submit-button" onClick={handleAddUser} disabled={loading}>
            הוסף משתמש
          </button>
        </div>
      </div>

      {loading && <div className="loading">טוען משתמשים...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && users.length === 0 && <div>לא נמצאו משתמשים.</div>}

      {!loading && users.length > 0 && (
        <div className="admin-users-table">
          <table>
            <thead>
              <tr>
                <th>שם משתמש</th>
                <th>אימייל</th>
                <th>תפקיד</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item._id}>
                  <td>{item.username}</td>
                  <td>{item.email}</td>
                  <td>
                    <select
                      value={selectedRoles[item._id] || item.role}
                      onChange={(e) => handleRoleChange(item._id, e.target.value as UserRole)}
                      disabled={item._id === currentUser?.id}
                    >
                      <option value="user">user</option>
                      <option value="creator">creator</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => handleSaveRole(item._id)}
                      disabled={updatingUserId === item._id || item._id === currentUser?.id}
                      className="btn-create"
                    >
                      {updatingUserId === item._id ? "שומר..." : "שמור"}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(item._id)}
                      disabled={item._id === currentUser?.id || loading}
                      className="cancel-button"
                    >
                      מחק
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1}>
            קודם
          </button>
          <span>
            עמוד {page} מתוך {totalPages}
          </span>
          <button onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={page === totalPages}>
            הבא
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
