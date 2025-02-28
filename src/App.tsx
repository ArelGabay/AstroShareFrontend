import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "./context/useAuth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PostList from "./components/PostList"; // Directly showing posts
import "./App.css"; // Import CSS

export default function App() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div>
      {/* Styled Navigation Bar */}
      <nav className="navbar">
        <div className="nav-buttons">
          {!user ? (
            <>
              <button className="auth-button" onClick={() => navigate("/login")}>Log in</button>
              <button className="auth-button" onClick={() => navigate("/register")}>Sign up</button>
            </>
          ) : (
            <>
              <button className="auth-button" onClick={() => navigate("/profile")}>Profile</button>
              <button className="auth-button" onClick={logout}>Logout</button>
            </>
          )}
        </div>
        <div className="logo">AstroShare</div>
      </nav>

      {/* Page Content */}
      <Routes>
        <Route path="/" element={
          <div className="post-container">
            {user ? <h1>Hello, {user}!</h1> : <h1 className="title">Welcome to AstroShare</h1>}
            <PostList />
          </div>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}