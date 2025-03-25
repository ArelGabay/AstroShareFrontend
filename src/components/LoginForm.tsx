/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import ChooseUsernameModal from "./ChooseUsernameModal";
import "../components/Form.css";

const backend_url = import.meta.env.VITE_BACKEND_URL;

const loginSchema = z.object({
  userName: z.string().regex(/^\S+$/, {
    message: "Spaces are not allowed",
  }),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // State for handling Google username conflict
  const [showChooseUsernameModal, setShowChooseUsernameModal] = useState(false);
  const [googleCredential, setGoogleCredential] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const response = await axios.post(
        backend_url + "/api/auth/login",
        data
      );
      localStorage.setItem("userId", response.data._id);
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("userName", response.data.userName);
      localStorage.setItem(
        "profilePictureUrl",
        response.data.profilePictureUrl
      );
      login({
        _id: response.data._id,
        userName: response.data.userName,
        profilePictureUrl: response.data.profilePictureUrl,
        isGoogleUser: false,
      });
      navigate("/");
    } catch (error) {
      setLoginError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleLoginSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    try {
      if (!credentialResponse.credential)
        throw new Error("No Google credential");
      const response = await axios.post(
        backend_url + "/api/auth/google",
        {
          credential: credentialResponse.credential,
        }
      );
      // Successful Google login; proceed to login
      localStorage.setItem("userId", response.data._id);
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("userName", response.data.userName);
      localStorage.setItem(
        "profilePictureUrl",
        response.data.profilePictureUrl
      );
      login({
        _id: response.data._id,
        userName: response.data.userName,
        profilePictureUrl: response.data.profilePictureUrl,
        isGoogleUser: true,
      });
      navigate("/");
    } catch (error: unknown) {
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.status === 409
      ) {
        // Username conflict: prompt user to choose a new username
        setShowChooseUsernameModal(true);
        setGoogleCredential(credentialResponse.credential ?? null);
      } else {
        console.error("Google login error:", error);
        setLoginError("Google login failed. Please try again.");
      }
    }
  };

  const handleCompleteGoogleLogin = async (chosenUsername: string) => {
    try {
      const response = await axios.post(
        backend_url + "/api/auth/google/complete",
        {
          credential: googleCredential,
          newUsername: chosenUsername,
        }
      );
      localStorage.setItem("userId", response.data._id);
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("userName", response.data.userName);
      localStorage.setItem(
        "profilePictureUrl",
        response.data.profilePictureUrl
      );
      login({
        _id: response.data._id,
        userName: response.data.userName,
        profilePictureUrl: response.data.profilePictureUrl,
        isGoogleUser: true,
      });
      setShowChooseUsernameModal(false);
      navigate("/");
    } catch (err) {
      console.error("Completing Google login failed:", err);
      setLoginError("Failed to complete Google login. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <h1 className="astroshare-welcome">Welcome to AstroShare</h1>
      {loginError && <p className="error-message">{loginError}</p>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label>Username</label>
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            {...register("userName")}
            className={errors.userName ? "error" : ""}
          />
          {errors.userName && (
            <p className="error-message">{errors.userName.message}</p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="password-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              {...register("password")}
              className={errors.password ? "error" : ""}
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>
          {errors.password && (
            <p className="error-message">{errors.password.message}</p>
          )}
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <GoogleLogin
        onSuccess={onGoogleLoginSuccess}
        onError={() => setLoginError("Google login failed")}
        theme="outline"
        size="large"
        shape="rectangular"
        width="100%"
      />

      {showChooseUsernameModal && (
        <ChooseUsernameModal
          defaultUsername=""
          onSubmit={(username) => handleCompleteGoogleLogin(username)}
          onCancel={() => setShowChooseUsernameModal(false)}
        />
      )}
    </div>
  );
};

export default LoginForm;
