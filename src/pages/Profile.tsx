import React from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import UpdateUser, { IUser } from "../components/UpdateUser";
import UpdateGoogleUser from "../components/UpdateGoogleUser";
import { useAuth } from "../context/useAuth";
import "./Profile.css";

const ProfilePage: React.FC = () => {
  const { refreshUserData, user } = useAuth();  // "user" is now used

  const handleUserUpdate = async () => {
    await refreshUserData();
  };

  if (!user) return <p>Loading user...</p>;

  return (
    <div className="profile-page">
      {user.isGoogleUser ? (
        <UpdateGoogleUser onUpdate={handleUserUpdate} />
      ) : (
        <UpdateUser onUpdate={handleUserUpdate} />
      )}
    </div>
  );
};

export default ProfilePage;