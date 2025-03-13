// ProfilePage.tsx
import React, { useState } from "react";
import UpdateUser, { IUser } from "../components/UpdateUser"; // Adjust path if necessary
import PostList from "../components/PostList";
import "./Profile.css";

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<IUser | null>(null);

  // Callback to update the user state when UpdateUser component updates it.
  const handleUserUpdate = (updatedUser: IUser) => {
    setUser(updatedUser);
  };

  return (
    <div className="profile-page">
      {/* Render UpdateUser component */}
      <UpdateUser onUpdate={handleUserUpdate} />
      {/* Render PostList component below UpdateUser */}
      {user ? (
        <PostList filterByUser={true} userName={user.userName} />
      ) : (
        // Optionally, if user is not set yet, use localStorage's username
        <PostList
          filterByUser={true}
          userName={localStorage.getItem("username") || ""}
        />
      )}
    </div>
  );
};

export default ProfilePage;
