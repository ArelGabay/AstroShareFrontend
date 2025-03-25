import { createContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";

const backend_url = import.meta.env.VITE_BACKEND_URL;

interface UserType {
  _id?: string;
  userName: string;
  profilePictureUrl?: string;
  isGoogleUser?: boolean; // Added
}

interface AuthContextType {
  user: UserType | null;
  login: (userData: UserType) => void;
  logout: () => void;
  refreshUserData: () => Promise<void>; // Added
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const refreshUserData = async () => {
    const storedUsername = localStorage.getItem("userName");
    if (!storedUsername) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(
        backend_url + `/api/users/${storedUsername}`,
        {
          headers: {
            Authorization: `JWT ${token}`,
          },
        }
      );

      const userData = response.data[0];

      const fullProfilePictureUrl = userData.profilePictureUrl
        ? userData.profilePictureUrl.startsWith("http")
          ? userData.profilePictureUrl
          : backend_url + `/public/${userData.profilePictureUrl}`
        : "";

      const isGoogleUser = !!userData.googleId; // true if googleId exists

      setUser({
        _id: userData._id,
        userName: userData.userName,
        profilePictureUrl: fullProfilePictureUrl,
        isGoogleUser,
      });

      localStorage.setItem("userName", userData.userName);
      localStorage.setItem("profilePictureUrl", fullProfilePictureUrl);
    } catch (err) {
      console.error("Failed to refresh user data", err);
    }
  };

  const login = (userData: UserType) => {
    const fullProfilePictureUrl = userData.profilePictureUrl
      ? userData.profilePictureUrl.startsWith("http")
        ? userData.profilePictureUrl
        : backend_url + `/public/${userData.profilePictureUrl}`
      : "";

    localStorage.setItem("userName", userData.userName);
    if (userData._id) {
      localStorage.setItem("userId", userData._id);
    }
    localStorage.setItem("profilePictureUrl", fullProfilePictureUrl);

    setUser({
      _id: userData._id,
      userName: userData.userName,
      profilePictureUrl: fullProfilePictureUrl,
      isGoogleUser: userData.isGoogleUser || false, // default to false if not provided
    });
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        console.warn("No refresh token found in local storage. Cannot logout.");
        return;
      }

      // Remove refresh token from local storage first
      localStorage.removeItem("userName");
      localStorage.removeItem("username");
      localStorage.removeItem("userId");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      console.log("Sending logout request with refreshToken:", refreshToken); // Debugging

      await axios.post(backend_url + "/api/auth/logout", {
        refreshToken,
      });

      // Ensure refreshToken is removed after logout
      localStorage.removeItem("userName");
      localStorage.removeItem("username");
      localStorage.removeItem("userId");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      setUser(null);
      console.log(
        "Local storage after logout:",
        localStorage.getItem("refreshToken")
      ); // Debugging
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    refreshUserData();
  }, []);

  return (
    // Added
    <AuthContext.Provider value={{ user, login, logout, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
}
