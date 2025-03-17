import React from "react";
import CommentsList from "../components/CommentsList";
import { ArrowLeftOutlined } from "@ant-design/icons";
import "./CommentsPage.css";

const CommentsPage: React.FC = () => {
  return (
    <div className="comments-page">
      <button className="back-button" onClick={() => window.history.back()}>
        <ArrowLeftOutlined style={{ fontSize: "24px", color: "#000" }} />
      </button>
      <CommentsList />
    </div>
  );
};

export default CommentsPage;
