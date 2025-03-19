// App.tsx
import { Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import PostList from "./components/PostList";
import CommentsPage from "./pages/CommentsPage.tsx";
import "./App.css";

export default function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Home + Posts + Profile */}
          <Route index element={<PostList />} />

          {/* Profile Page */}
          <Route path="profile" element={<Profile />} />

          {/* Login */}
          <Route path="login" element={<Login />} />

          {/* Register */}
          <Route path="register" element={<Register />} />

          {/* Comments */}
          <Route path="comments/:postId" element={<CommentsPage />} />
        </Route>
      </Routes>
    </div>
  );
}