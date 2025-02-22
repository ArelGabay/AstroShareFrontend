import { FC, useState, useEffect } from "react";
import axios from "axios";
import "./Post.css";

interface PostProps {
  post: {
    _id: string; // Or _id if that's your field
    title: string;
    content: string;
    sender: string; // username of the user who created the post
    pictureUrl?: string;
    likes?: string[];
  };
}

const Post: FC<PostProps> = ({ post }) => {
  // Assume the current user's username and token are stored in localStorage.
  const currentUser = localStorage.getItem("username") || "Anonymous";
  const token = localStorage.getItem("accessToken") || "";

  console.log("Current user:", currentUser);

  // Initialize local state from the post's likes only once.
  const [liked, setLiked] = useState<boolean>(
    post.likes ? post.likes.includes(currentUser) : false
  );
  const [likeCount, setLikeCount] = useState<number>(
    post.likes ? post.likes.length : 0
  );
  const [senderName, setSenderName] = useState<string>(post.sender);

  useEffect(() => {
    setSenderName(post.sender);
  }, [post.sender]);

  const handleLike = async () => {
    console.log(
      "Toggle like clicked for post:",
      post._id,
      "by user:",
      currentUser
    );
    try {
      const endpoint = `http://localhost:3000/api/posts/like/${post._id}`;
      console.log("Sending request to:", endpoint);
      const response = await axios.post(
        endpoint,
        { username: currentUser },
        { headers: { Authorization: `JWT ${token}` } }
      );
      console.log("Response from server:", response.data);
      // Update state based on the updated post returned by the server.
      setLikeCount(response.data.likes.length);
      setLiked(response.data.likes.includes(currentUser));
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <h2 className="post-title">{post.title}</h2>
        <p className="post-sender">
          {senderName ? `By: ${senderName}` : "Loading sender..."}
        </p>
      </div>

      <div className="post-body">
        <p className="post-content">{post.content}</p>
        {post.pictureUrl && (
          <div className="post-picture-container">
            <img
              src={post.pictureUrl}
              alt="Post visual"
              className="post-image"
            />
          </div>
        )}
      </div>

      <div className="post-footer">
        <button onClick={handleLike} className="like-button">
          {liked ? "Unlike" : "Like"}
        </button>
        <span className="likes-count">
          {likeCount} {likeCount === 1 ? "like" : "likes"}
        </span>
      </div>
    </div>
  );
};

export default Post;
