import { useState, useEffect } from "react";
import axios from "axios";

interface Post {
  title: string;
  content: string;
  sender: string;
}

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    axios
      .get<Post[]>("http://localhost:3000/api/posts")
      .then((response) => setPosts(response.data))
      .catch((error) => console.error("Error fetching posts:", error));
  }, []);

  return (
    <div>
      <h1>Posts</h1>
      <ul>
        {posts.map((post, index) => (
          <li key={index}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            <p><strong>Sender:</strong> {post.sender}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}