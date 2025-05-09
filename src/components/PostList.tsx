import { FC, useState, useEffect } from "react";
import Post from "./Post";
import Pagination from "./Pagination";
import axios from "axios";
import { PlusOutlined } from "@ant-design/icons";
import AddPostModal from "./AddPostModal";
import { useAuth } from "../context/useAuth";
import "./PostList.css";

const backend_url = import.meta.env.VITE_BACKEND_URL;

interface PostType {
  _id: string;
  title: string;
  content: string;
  sender: string;
  pictureUrl?: string;
  likes?: string[];
}

const PostList: FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  // New state: filter posts by the current user
  const [filterByMe, setFilterByMe] = useState<boolean>(false);
  const postsPerPage = 3;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let url = backend_url + "/api/posts";
        // When filtering, use the user ID from localStorage
        if (filterByMe && user) {
          const currentUserId = localStorage.getItem("userId");
          if (currentUserId) {
            url = backend_url + `/api/posts/sender/${currentUserId}`;
          }
        }
        const response = await axios.get(url);
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, [filterByMe, user]);

  // Remove a deleted post from state
  const handlePostDelete = (id: string) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== id));
  };

  // Update a post in the state
  const handlePostUpdate = (updatedPost: PostType) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  };

  // Add a new post to state
  const handleAddPost = async (newData: {
    title: string;
    content: string;
    photo?: File | null;
  }) => {
    try {
      const formData = new FormData();
      formData.append("title", newData.title);
      formData.append("content", newData.content);
      formData.append("sender", localStorage.getItem("userId") || "Anonymous");
      if (newData.photo) {
        formData.append("photo", newData.photo);
      }
      const token = localStorage.getItem("accessToken") || "";
      const response = await axios.post(
        backend_url + `/api/posts`,
        formData,
        {
          headers: {
            Authorization: `JWT ${token}`,
          },
        }
      );
      setPosts((prev) => [response.data, ...prev]);
      setAddModalVisible(false);
    } catch (error) {
      console.error("Error adding new post:", error);
    }
  };

  // Calculate posts for the current page
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  // Handle page change
  const paginate = (pageNumber: number): void => setCurrentPage(pageNumber);

  return (
    <div style={{ position: "relative" }}>
      {/* Toggle switch for filtering posts */}
      <div className="toggle-filter-container">
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={filterByMe}
            onChange={() => {
              if (user) setFilterByMe(!filterByMe);
            }}
            disabled={!user}
          />
          <span className="slider"></span>
        </label>
        <span className="toggle-label">
          {filterByMe ? "My Posts" : "All Posts"}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "20px",
          justifyContent: "center",
        }}
      >
        {currentPosts.map((post) => (
          <Post
            key={post._id}
            post={post}
            onDelete={handlePostDelete}
            onUpdate={handlePostUpdate} // Pass the update callback
          />
        ))}
      </div>
      <Pagination
        postsPerPage={postsPerPage}
        totalPosts={posts.length}
        currentPage={currentPage}
        paginate={paginate}
      />
      <button
        className="add-post-button"
        onClick={() => setAddModalVisible(true)}
        disabled={!user}
      >
        <PlusOutlined style={{ fontSize: "24px", color: "#fff" }} />
      </button>
      {addModalVisible && (
        <AddPostModal
          visible={addModalVisible}
          onAdd={handleAddPost}
          onCancel={() => setAddModalVisible(false)}
        />
      )}
    </div>
  );
};

export default PostList;
