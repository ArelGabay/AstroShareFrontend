// ProfilePage.tsx
import React from "react";
import UpdateUser, { IUser } from "../components/UpdateUser"; // Adjust path if necessary
import PostList from "../components/PostList";
import { useAuth } from "../context/useAuth";
import "./Profile.css";

const ProfilePage: React.FC = () => {
  const { login, user } = useAuth(); // Use the user state from the AuthContext

  // Callback to update the user state when UpdateUser component updates it.
  const handleUserUpdate = (updatedUser: IUser) => {
    login({
      userName: updatedUser.userName,
      profilePictureUrl: updatedUser.profilePictureUrl,
      isGoogleUser: user?.isGoogleUser || false, // Preserve the flag!
    });
  };

  return (
    <div className="profile-page">

      {/* If NOT a Google user, show edit profile */}
      {!user?.isGoogleUser && (
        <UpdateUser onUpdate={handleUserUpdate} />
      )}

      {/* If Google user, show message */}
      {user?.isGoogleUser && (
        <p className="info-message">Signed in with Google - Profile cannot be edited.</p>
      )}

      {/* Posts */}
      {user ? (
        <PostList filterByUser={true} userName={user.userName} />
      ) : (
        <PostList
          filterByUser={true}
          userName={localStorage.getItem("username") || ""}
        />
      )}
    </div>
  );
};

export default ProfilePage;