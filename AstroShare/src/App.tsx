import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

// Define the Post interface
interface Posts {
  title: string;
  content: string;
  sender: string;
}

// Create PostList component to fetch and display posts
function PostList() {
  const [posts, setPosts] = useState<Posts[]>([]);

  // Fetch posts from the backend when the component mounts
  useEffect(() => {
    axios
      .get<Posts[]>("http://localhost:3000/api/posts")
      .then((response) => {
        setPosts(response.data);
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
      });
  }, []);

  return (
    <div>
      <h1>Posts</h1>
      {/* Render each post */}
      <ul>
        {posts.map((post, index) => (
          <li key={index}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            <p>
              <strong>Sender:</strong> {post.sender}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      {/* Render the PostList component */}
      <PostList />
    </div>
  );
}

export default App;
