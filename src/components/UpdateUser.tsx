// UpdateUser.tsx
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import "./UpdateUser.css";

export interface IUser {
  _id?: string;
  userName: string;
  email: string;
  password: string;
  googleId?: string;
  profilePictureUrl?: string;
  refreshTokens?: string[];
}

interface UpdateFormData {
  newPassword: string;
  confirmPassword: string;
  profilePicture: FileList;
}

interface UpdateUserProps {
  onUpdate: (user: IUser) => void;
}

const UpdateUser: React.FC<UpdateUserProps> = ({ onUpdate }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [editing, setEditing] = useState<boolean>(false);
  const [updateMessage, setUpdateMessage] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { register, handleSubmit, watch, reset } = useForm<UpdateFormData>();

  // Destructure register for profilePicture to separate ref and other props
  const { ref: profilePictureRef, ...profilePictureRest } =
    register("profilePicture");

  // Watch the file input to display a preview
  const watchedProfilePicture = watch("profilePicture");

  useEffect(() => {
    if (watchedProfilePicture && watchedProfilePicture.length > 0) {
      setSelectedFile(watchedProfilePicture[0]);
    }
  }, [watchedProfilePicture]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUsername = localStorage.getItem("username");
        if (!storedUsername) {
          setError("No username found in local storage");
          setLoading(false);
          return;
        }
        const response = await axios.get(
          `http://localhost:3000/api/users/${storedUsername}`
        );
        // Assuming the API returns an array; we take the first user.
        setUser(response.data[0]);
      } catch (err) {
        console.error("Error fetching user info:", err);
        setError("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const { refreshUserData } = useAuth();

  const onSubmit = async (data: UpdateFormData) => {
    setUpdateMessage("");

    if (data.newPassword && data.newPassword !== data.confirmPassword) {
      setUpdateMessage("Passwords do not match");
      return;
    }

    if (!user || !user._id) {
      setUpdateMessage("User data is not loaded");
      return;
    }

    try {
      const formData = new FormData();
      if (data.newPassword) {
        formData.append("password", data.newPassword);
      }
      if (data.profilePicture && data.profilePicture.length > 0) {
        formData.append("profilePicture", data.profilePicture[0]);
        if (user.profilePictureUrl) {
          formData.append("oldProfilePictureUrl", user.profilePictureUrl);
        }
      }

      const token = localStorage.getItem("accessToken");
      const response = await axios.put(
        `http://localhost:3000/api/users/${user.userName}`,
        formData,
        {
          headers: {
            Authorization: `JWT ${token}`,
          },
        }
      );

      setUser(response.data);
      localStorage.setItem("profilePictureUrl", response.data.profilePictureUrl);
      setUpdateMessage("Profile updated successfully");
      setEditing(false);
      reset();
      setSelectedFile(null);
      onUpdate(response.data);

      // Added
      await refreshUserData();
      
    } catch (err) {
      console.error("Error updating user info:", err);
      setUpdateMessage("Failed to update profile");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="card update-user-card">
      {user?.profilePictureUrl && (
        <img
          className="card-img"
          src={"http://localhost:3000/public/" + user.profilePictureUrl}
          alt="Profile"
        />
      )}
      <div className="card-content">
        <p className="card-info">Username: {user?.userName}</p>
        <p className="card-info">Email: {user?.email}</p>
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn-edit">
          {!user?.googleId && !editing && (
          <button onClick={() => setEditing(true)} className="btn-edit">
            Edit Profile
          </button>
          )}
        {user?.googleId && (
          <p className="info-message">Google users cannot edit profile here.</p>
)}
          </button>
        )}
        {editing && (
          <form onSubmit={handleSubmit(onSubmit)} className="update-form">
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                placeholder="Enter new password"
                {...register("newPassword")}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm new password"
                {...register("confirmPassword")}
              />
            </div>
            <div className="form-group">
              <label htmlFor="profilePicture">Profile Picture</label>
              <input
                type="file"
                id="profilePicture"
                accept="image/*"
                {...profilePictureRest}
                ref={(e) => {
                  profilePictureRef(e);
                }}
              />
            </div>
            {selectedFile && (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Selected profile"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  marginBottom: "1rem",
                }}
              />
            )}
            <div className="form-actions">
              <button type="submit" className="btn-update">
                Update Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  reset();
                  setSelectedFile(null);
                }}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        {updateMessage && <p className="update-message">{updateMessage}</p>}
      </div>
    </div>
  );
};

export default UpdateUser;
