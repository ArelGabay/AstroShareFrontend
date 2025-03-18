import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import "./UpdateUser.css"; // reuse same CSS!

export interface IUser {
  _id?: string;
  userName: string;
  email: string;
  googleId?: string;
  profilePictureUrl?: string;
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

const UpdateGoogleUser: React.FC<UpdateUserProps> = ({ onUpdate }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editing, setEditing] = useState<boolean>(false);
  const [updateMessage, setUpdateMessage] = useState<string>("");

  const { register, handleSubmit, watch, reset } = useForm<UpdateFormData>();
  const { refreshUserData } = useAuth();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const watchedProfilePicture = watch("profilePicture");

  const selectedFile = watchedProfilePicture && watchedProfilePicture.length > 0
  ? watchedProfilePicture[0]
  : null;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUsername = localStorage.getItem("userName");
        const token = localStorage.getItem("accessToken");

        const response = await axios.get(
          `http://localhost:3000/api/users/${storedUsername}`,
          {
            headers: { Authorization: `JWT ${token}` },
          }
        );

        setUser(response.data[0]);
      } catch (err) {
        console.error("Error fetching user info:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const onSubmit = async (data: UpdateFormData) => {
    if (!user || !user._id) {
      setUpdateMessage("User data is not loaded");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("userName", data.userName);

      if (data.profilePicture && data.profilePicture.length > 0) {
        formData.append("profilePicture", data.profilePicture[0]);
      }

      const token = localStorage.getItem("accessToken");

      const response = await axios.put(
        `http://localhost:3000/api/users/google/${user.userName}`,
        formData,
        {
          headers: {
            Authorization: `JWT ${token}`,
          },
        }
      );

      console.log("API Response after update:", response.data);

      const fullProfilePictureUrl = response.data.profilePictureUrl.startsWith("http")
      ? response.data.profilePictureUrl
      : `http://localhost:3000/public/${response.data.profilePictureUrl}`;

      localStorage.setItem("userName", response.data.userName);
      localStorage.setItem("profilePictureUrl", fullProfilePictureUrl);
      
      setUser(response.data);
      setUpdateMessage("Google Profile updated successfully");
      setEditing(false);
      reset();

      onUpdate({...response.data,
        profilePictureUrl: fullProfilePictureUrl,
      });

      await refreshUserData();
    } catch (err) {
      console.error("Error updating Google user info:", err);
      setUpdateMessage("Failed to update profile");
    }
  };

  if (loading) return <p>Loading Google user data...</p>;

  return (
    <div className="card update-user-card">
      {user?.profilePictureUrl && (
        <img
          className="card-img"
          src={
            user?.profilePictureUrl?.startsWith("http")
              ? user.profilePictureUrl
              : `http://localhost:3000/public/${user.profilePictureUrl}`
          }
          alt="Profile"
        />
      )}

      <div className="card-content">
      {user && user.bio && (
          <div className="bio-section">
            <p>{user.bio}</p>
          </div>
        )}
        {!editing && (
          <button onClick={() => setEditing(true)} className="btn-edit">
            Edit Google Profile
          </button>
        )}

        {editing && (
          <form onSubmit={handleSubmit(onSubmit)} className="update-form">
            <div className="form-group">
              <label htmlFor="userName">Username</label>
              <input
                type="text"
                id="userName"
                defaultValue={user?.userName}
                {...register("userName")}
                required
              />
            </div>

            <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              placeholder="Tell us about yourself..."
              defaultValue={user?.bio}
              {...register("bio")}
              className="bio-input"
            />
          </div>

            <div className="form-group">
              <label htmlFor="profilePicture">Profile Picture</label>
              <input
                type="file"
                id="profilePicture"
                accept="image/*"
                {...register("profilePicture")}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-update">
                Update Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  reset();
                }}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

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

        {updateMessage && <p className="update-message">{updateMessage}</p>}
      </div>
    </div>
  );
};

export default UpdateGoogleUser;