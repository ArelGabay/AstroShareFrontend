import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { CheckOutlined, CloseOutlined, PlusOutlined } from "@ant-design/icons";
import Comment from "./Comment";
import { useAuth } from "../context/useAuth"; // Import your auth hook
import "./CommentsList.css";

interface IComment {
  _id: string;
  content: string;
  sender: string;
  postId: string;
}

const CommentsList: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuth(); // Get logged-in user
  const currentUser = user ? user.userName : "Anonymous";
  const userId = user ? user._id : "";
  const [comments, setComments] = useState<IComment[]>([]);
  const [addingComment, setAddingComment] = useState<boolean>(false);
  const [newComment, setNewComment] = useState<string>("");

  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/comments/post/${postId}`
      );
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const response = await axios.post(
        "http://localhost:3000/api/comments",
        { content: newComment, sender: userId, postId },
        {
          headers: {
            Authorization: `JWT ${localStorage.getItem("accessToken") || ""}`,
          },
        }
      );
      setComments((prev) => [response.data, ...prev]);
      setNewComment("");
      setAddingComment(false);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleUpdateComment = async (id: string, newContent: string) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/api/comments/${id}`,
        { content: newContent, sender: userId, postId },
        {
          headers: {
            Authorization: `JWT ${localStorage.getItem("accessToken") || ""}`,
          },
        }
      );
      setComments((prev) =>
        prev.map((comment) => (comment._id === id ? response.data : comment))
      );
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3000/api/comments/${id}`, {
        headers: {
          Authorization: `JWT ${localStorage.getItem("accessToken") || ""}`,
        },
      });
      setComments((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <div className="comments-list-container">
      <h1>Comments</h1>
      <div className="comments-list">
        {comments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <Comment
              key={comment._id}
              comment={comment}
              currentUser={currentUser}
              onUpdate={handleUpdateComment}
              onDelete={handleDeleteComment}
            />
          ))
        )}
      </div>
      {addingComment && (
        <form onSubmit={handleAddComment} className="add-comment-form-inline">
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
          />
          <button type="submit" className="inline-add-btn">
            <CheckOutlined />
          </button>
          <button
            type="button"
            onClick={() => {
              setNewComment("");
              setAddingComment(false);
            }}
            className="inline-cancel-btn"
          >
            <CloseOutlined />
          </button>
        </form>
      )}
      {/* Floating add comment button */}
      <button
        className="add-comment-button"
        onClick={() => setAddingComment(true)}
        disabled={!user} // Disable if no user is logged in
      >
        <PlusOutlined style={{ fontSize: "24px", color: "#fff" }} />
      </button>
    </div>
  );
};

export default CommentsList;
