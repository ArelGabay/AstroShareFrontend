import { FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LikeOutlined,
  LikeFilled,
  CommentOutlined,
  PictureOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import UpdatePostModal from "./UpdatePostModal";
import "./Post.css";

interface PostData {
  _id: string;
  title: string;
  content: string;
  sender: string; // Likely the user ID
  pictureUrl?: string;
  likes?: string[];
}

interface PostProps {
  post: PostData;
  onDelete?: (id: string) => void;
  onUpdate?: (updatedPost: PostData) => void; // New callback prop
}

const Post: FC<PostProps> = ({ post, onDelete, onUpdate }) => {
  const currentUser = localStorage.getItem("userName") || "Anonymous";
  const userId = localStorage.getItem("userId") || "";
  const token = localStorage.getItem("accessToken") || "";
  const navigate = useNavigate();

  const hasPicture = Boolean(post.pictureUrl);

  const [liked, setLiked] = useState<boolean>(
    post.likes ? post.likes.includes(userId) : false
  );
  const [likeCount, setLikeCount] = useState<number>(
    post.likes ? post.likes.length : 0
  );
  const [senderName, setSenderName] = useState<string>("Loading sender...");
  const [commentCount, setCommentCount] = useState<number>(0);
  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false);

  // Fetch the sender's username using the sender ID
  useEffect(() => {
    const fetchUserName = async (userId: string) => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/users/id/${userId}`
        );
        // Adjust based on the structure of your API response
        setSenderName(response.data.userName);
      } catch (error) {
        console.error("Error fetching sender user name:", error);
        setSenderName("Anonymous");
      }
    };

    if (post.sender) {
      fetchUserName(post.sender);
    }
  }, [post.sender]);

  // Fetch comments count for this post
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/comments/post/${post._id}`
        );
        setCommentCount(response.data.length);
      } catch (error) {
        console.error("Error fetching comments count:", error);
      }
    };
    fetchComments();
  }, [post._id]);

  const handleLike = async () => {
    try {
      const endpoint = `http://localhost:3000/api/posts/like/${post._id}`;
      const response = await axios.post(
        endpoint,
        { username: currentUser, userId: userId },
        { headers: { Authorization: `JWT ${token}` } }
      );
      setLikeCount(response.data.likes.length);
      setLiked(response.data.likes.includes(userId));
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleCommentsClick = () => {
    navigate(`/comments/${post._id}`);
  };

  // Open update modal popup
  const handleUpdateClick = () => {
    setUpdateModalVisible(true);
  };

  // Update post and call onUpdate callback
  const handleUpdatePost = async (updatedData: {
    title: string;
    content: string;
    photo?: File | null;
    deletePhoto?: boolean;
  }) => {
    const formData = new FormData();
    formData.append("title", updatedData.title);
    formData.append("content", updatedData.content);
    formData.append("pictureUrl", post.pictureUrl || "");

    if (updatedData.photo) {
      formData.append("photo", updatedData.photo);
      if (post.pictureUrl) {
        formData.append("oldPictureUrl", post.pictureUrl);
      }
    }

    if (updatedData.deletePhoto) {
      formData.append("deletePhoto", "true");
    }

    try {
      const response = await axios.put(
        `http://localhost:3000/api/posts/${post._id}`,
        formData,
        {
          headers: {
            Authorization: `JWT ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // Call the onUpdate callback with the updated post data
      if (onUpdate) {
        onUpdate(response.data);
      }
      setUpdateModalVisible(false);
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const handleCancelUpdate = () => {
    setUpdateModalVisible(false);
  };

  const handleDelete = async () => {
    try {
      const endpoint = `http://localhost:3000/api/posts/${post._id}`;
      await axios.delete(endpoint, {
        headers: { Authorization: `JWT ${token}` },
      });
      if (onDelete) {
        onDelete(post._id);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
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
        <div className="post-picture-container">
          {hasPicture ? (
            <img
              src={"http://localhost:3000/public/" + post.pictureUrl}
              alt="Post visual"
              className="post-image"
            />
          ) : (
            <div className="no-picture">
              <PictureOutlined className="no-picture-icon" />
            </div>
          )}
        </div>
      </div>

      <div className="post-footer-wrapper">
        <div className="post-footer">
          <div className="like-section">
            <span
              onClick={handleLike}
              className={`icon-button like-icon ${liked ? "blue-icon" : ""}`}
            >
              {liked ? <LikeFilled /> : <LikeOutlined />}
            </span>
            <span className="likes-count">{likeCount}</span>
          </div>
          <div className="comment-section">
            <span
              onClick={handleCommentsClick}
              className="icon-button comments-icon blue-icon"
            >
              <CommentOutlined />
            </span>
            <span className="comments-count">{commentCount}</span>
          </div>
          {post.sender === userId && (
            <div className="action-section">
              <span
                onClick={handleUpdateClick}
                className="icon-button action-button update-button"
              >
                <EditOutlined />
              </span>
              <span
                onClick={handleDelete}
                className="icon-button action-button delete-button"
              >
                <DeleteOutlined />
              </span>
            </div>
          )}
        </div>
      </div>
      {updateModalVisible && (
        <UpdatePostModal
          visible={updateModalVisible}
          post={post}
          onUpdate={handleUpdatePost}
          onCancel={handleCancelUpdate}
        />
      )}
    </div>
  );
};

export default Post;
