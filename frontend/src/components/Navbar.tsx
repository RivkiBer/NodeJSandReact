import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { clearUser } from "../store/userSlice";

const Navbar = () => {
  const user = useAppSelector((state) => state.user.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const canCreate = user?.role === "admin" || user?.role === "creator";

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch(clearUser());
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <Link to="/">סקרים וסטטיסטיקות</Link>
      </div>
      <div className="navbar__links">
        {!user && (
          <>
            <Link to="/login">התחבר</Link>
            <Link to="/register">הירשם</Link>
          </>
        )}

        {user && (
          <>
            <Link to="/surveys">הסקרים</Link>
            {canCreate && <Link to="/surveys/create">צור סקר</Link>}
            {user.role === "admin" && <Link to="/admin/users">ניהול משתמשים</Link>}
            <span className="navbar__user">שלום, {user.username} ({user.role})</span>
            <button onClick={handleLogout} className="logout-button">התנתק</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
