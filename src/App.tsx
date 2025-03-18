import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "./context/useAuth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import PostList from "./components/PostList";
import CommentsPage from "./pages/CommentsPage.tsx";
import { MdOutlineTravelExplore } from "react-icons/md"; // explore icon
import { useState } from "react";
import "./App.css";

export default function App() {
  const navigate = useNavigate();
  const [showMyPosts, setShowMyPosts] = useState(false);
  const { user, logout } = useAuth();

  const toggleMyPosts = () => {
    setShowMyPosts((prev) => !prev);
  };

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

      <Routes>
      <Route
          path="/"
          element={
            <>
              {/* Toggle Button */}
              {user && (
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                  <button
                    onClick={toggleMyPosts}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "25px",
                      backgroundColor: showMyPosts ? "#e60023" : "#f0f0f0",
                      color: showMyPosts ? "#fff" : "#333",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    {showMyPosts ? "Show All Posts" : "Show My Posts"}
                  </button>
                </div>
              )}

              {/* PostList component */}
              <div className="post-container">
                <PostList
                  filterByUser={showMyPosts}
                  userName={user?.userName || ""}
                />
              </div>
            </>
          }
        />
        <Route
          path="/login" 
          element={
          <div className ="auth-page-container">
          <Login />
          </div>
          }
        />
        <Route 
          path="/register"
          element={
          <div className="auth-page-container">
          <Register />
          </div>
          }
        />

        <Route path="/profile" element={<Profile />} />
        <Route path="/comments/:postId" element={<CommentsPage />} />
      </Routes>
    </div>
  );
}
