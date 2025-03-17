import React, { useState } from "react";
import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import "./Comment.css";

interface CommentProps {
  comment: {
    _id: string;
    content: string;
    sender: string;
    postId: string;
  };
  currentUser: string;
  onUpdate: (id: string, newContent: string) => void;
  onDelete: (id: string) => void;
}

const Comment: React.FC<CommentProps> = ({
  comment,
  currentUser,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedContent, setEditedContent] = useState<string>(comment.content);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(comment.content);
  };

  const handleSaveEdit = () => {
    onUpdate(comment._id, editedContent);
    setIsEditing(false);
  };

  return (
    <div className="comment-card">
      <div className="comment-main">
        <p className="comment-sender">By: {comment.sender}</p>
        {isEditing ? (
          <textarea
            className="comment-edit-textarea"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
          />
        ) : (
          <p className="comment-content">{comment.content}</p>
        )}
      </div>
      {comment.sender === currentUser && (
        <div className="comment-actions">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveEdit}
                className="action-button save-btn"
              >
                <CheckOutlined />
              </button>
              <button
                onClick={handleCancelEdit}
                className="action-button cancel-btn"
              >
                <CloseOutlined />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEditClick}
                className="action-button edit-btn"
              >
                <EditOutlined />
              </button>
              <button
                onClick={() => onDelete(comment._id)}
                className="action-button delete-btn"
              >
                <DeleteOutlined />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Comment;
