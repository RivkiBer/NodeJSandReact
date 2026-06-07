import { Link } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

const Navbar = () => {
  const user = useAppSelector((state) => state.user.user);

  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <Link to="/">Survey Stats</Link>
      </div>
      <div className="navbar__links">
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        {user ? <span className="navbar__user">{user.name}</span> : null}
      </div>
    </nav>
  );
};

export default Navbar;
