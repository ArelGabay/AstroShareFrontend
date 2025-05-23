// UpdateUser.tsx
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import "./UpdateUser.css"; // Import the CSS defined above

const backend_url = import.meta.env.VITE_BACKEND_URL;

export interface IUser {
  _id?: string;
  userName: string;
  email: string;
  password?: string;
  googleId?: string;
  profilePictureUrl?: string;
  refreshTokens?: string[];
  bio?: string;
}

interface UpdateFormData {
  userName: string;
  profilePicture: FileList;
  bio: string;
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
  const watchedProfilePicture = watch("profilePicture");
  const { refreshUserData } = useAuth();

  useEffect(() => {
    if (watchedProfilePicture && watchedProfilePicture.length > 0) {
      setSelectedFile(watchedProfilePicture[0]);
    }
  }, [watchedProfilePicture]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUsername = localStorage.getItem("userName");
        if (!storedUsername) {
          setError("No username found in local storage");
          setLoading(false);
          return;
        }
        const response = await axios.get(
          backend_url + `/api/users/${storedUsername}`
        );
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

  const onSubmit = async (data: UpdateFormData) => {
    setUpdateMessage("");
    if (!user || !user._id) {
      setUpdateMessage("User data is not loaded");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("userName", data.userName);
      formData.append("bio", data.bio);
      if (data.profilePicture && data.profilePicture.length > 0) {
        console.log("picture exists");
        formData.append("profilePicture", data.profilePicture[0]);
        if (user.profilePictureUrl) {
          formData.append("oldProfilePictureUrl", user.profilePictureUrl);
        }
      }
      const token = localStorage.getItem("accessToken");
      console.log("formData", formData);
      const response = await axios.put(
        backend_url + `/api/users/${user.userName}`,
        formData,
        {
          headers: { Authorization: `JWT ${token}` },

        }
      );
      const updatedUser = response.data;
      console.log("Updated user:", updatedUser);
      console.log("response", response);
      setUser(updatedUser);
      setUpdateMessage("Profile updated successfully!");
      setEditing(false);
      reset();
      setSelectedFile(null);
      localStorage.setItem("profilePictureUrl", updatedUser.profilePictureUrl);
      localStorage.setItem("userName", updatedUser.userName);
      onUpdate(updatedUser);
      await refreshUserData();
    } catch (err) {
      console.error("Error updating user info:", err);
      setUpdateMessage("Failed to update profile.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="update-user-page-container">
      <form className="update-user-form-container" onSubmit={handleSubmit(onSubmit)}>
        <h2>Edit Profile</h2>

        {/* Profile Picture Section */}
        <div className="profile-pic-wrapper">
          <img
            className="profile-pic"
            src={
              selectedFile
                ? URL.createObjectURL(selectedFile)
                : user?.profilePictureUrl?.startsWith("http")
                ? user.profilePictureUrl
                : backend_url + `/public/${user?.profilePictureUrl || ""}`
            }
            alt="Profile"
          />
          {editing && (
            <div
              className="upload-icon"
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path fill="currentColor" d="M0 96C0 60.7 28.7 32 64 32l384 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zM323.8 202.5c-4.5-6.6-11.9-10.5-19.8-10.5s-15.4 3.9-19.8 10.5l-87 127.6L170.7 297c-4.6-5.7-11.5-9-18.7-9s-14.2 3.3-18.7 9l-64 80c-5.8 7.2-6.9 17.1-2.9 25.4s12.4 13.6 21.6 13.6l96 0 32 0 208 0c8.9 0 17.1-4.9 21.2-12.8s3.6-17.4-1.4-24.7l-120-176zM112 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"></path>
              </svg>
            </div>
          )}
        </div>
        <input
          type="file"
          id="fileInput"
          style={{ display: "none" }}
          accept="image/*"
          {...register("profilePicture")}
        />

        {/* Username */}
        <div className="form-group">
          <label>Username</label>
          {editing ? (
            <input
              type="text"
              defaultValue={user?.userName}
              {...register("userName")}
              required
            />
          ) : (
            <input type="text" value={user?.userName || ""} readOnly />
          )}
        </div>

        {/* Bio */}
        <div className="form-group">
          <label>Bio</label>
          {editing ? (
            <textarea
              placeholder="Update my bio"
              defaultValue={user?.bio || ""}
              {...register("bio")}
            />
          ) : (
            <textarea value={user?.bio || ""} readOnly />
          )}
        </div>

        {/* Email (read-only) */}
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={user?.email || ""} readOnly />
        </div>

        {/* Buttons */}
        {!editing && (
          <button type="button" className="btn-edit" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        )}

        {editing && (
          <div className="form-actions">
            <button type="submit" className="btn-update">
              Save changes
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setEditing(false);
                reset();
                setSelectedFile(null);
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {updateMessage && <p className="update-message">{updateMessage}</p>}
      </form>
    </div>
  );
};

export default UpdateUser;