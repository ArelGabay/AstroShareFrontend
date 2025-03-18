// CommentsPage.tsx
import React from "react";
import CommentsList from "../components/CommentsList";
import "./CommentsPage.css";

const CommentsPage: React.FC = () => {
  return (
    <div className="comment-page-container">
      <CommentsList />
    </div>
  );
};

export default CommentsPage;