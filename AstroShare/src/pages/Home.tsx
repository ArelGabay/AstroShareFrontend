import { useAuth } from "../context/useAuth";
import PostList from "../components/PostList";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>{user ? `Hey, ${user}!` : "Welcome to AstroShare"}</h1>
      {user && <button onClick={logout}>Logout</button>}
      <PostList />
    </div>
  );
}
