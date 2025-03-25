// Layout.tsx
import { Outlet, useNavigate } from "react-router-dom";
import { MdOutlineTravelExplore } from "react-icons/md";
import { useAuth } from "./context/useAuth";
import "./App.css";

export default function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const backend_url = import.meta.env.VITE_BACKEND_URL;

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="astroshare-logo" onClick={() => navigate("/")}>
          <MdOutlineTravelExplore size={28} color="#e60023" />
          <span>AstroShare</span>
        </div>
        <div className="button-group">
          {!user ? (
            <>
              <button
                className="login-button"
                onClick={() => navigate("/login")}
              >
                Log in
              </button>
              <button
                className="signup-button"
                onClick={() => navigate("/register")}
              >
                Sign up
              </button>
            </>
          ) : (
            <button
              className="logout-button"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* Profile Section */}
      <div className="profile-section">
        {user ? (
          <>
            {user.profilePictureUrl && (
              <img
                src={
                  user?.profilePictureUrl?.startsWith("http")
                    ? user.profilePictureUrl
                    : backend_url + `/public/${user.profilePictureUrl}`
                }
                alt="Profile"
                className="profile-picture clickable"
                onClick={() => navigate("/profile")}
              />
            )}
            <span className="user-name">{user.userName}</span>
          </>
        ) : (
          <div className="profile-placeholder" />
        )}
      </div>

      {/* Main Content */}
      <div className="main-content">
        <Outlet />
      </div>
    </>
  );
}