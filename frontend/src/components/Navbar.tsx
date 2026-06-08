import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { clearUser } from "../store/userSlice";

const Navbar = () => {
  const user = useAppSelector((state) => state.user.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/surveys">Surveys</Link>
        <Link to="/surveys/create">Create Survey</Link>
        <Link to="/responses">Respond</Link>
        {user ? (
          <>
            <span className="navbar__user">{user.username}</span>
            <button className="navbar__logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
};

export default Navbar;
