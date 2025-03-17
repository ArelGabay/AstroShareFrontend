import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "./context/useAuth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import PostList from "./components/PostList";
import CommentsPage from "./pages/CommentsPage.tsx";
import { MdOutlineTravelExplore } from "react-icons/md"; // explore icon
import "./App.css";

export default function App() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="app-container">
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
                navigate("/");
                logout();
              }}
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {user && (
        <div className="profile-section">
          {user.profilePictureUrl && (
            <img
              src={user.profilePictureUrl}
              alt="Profile"
              className="profile-picture clickable"
              onClick={() => navigate("/profile")}
            />
          )}
          <span className="user-name">{user.userName}</span>
        </div>
      )}

      <div className="page-container">
        <Routes>
          <Route
            path="/"
            element={
              <div className="post-container">
                <PostList />
              </div>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/comments/:postId" element={<CommentsPage />} />
        </Routes>
      </div>
    </div>
  );
}
