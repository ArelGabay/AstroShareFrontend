import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../context/useAuth";
import "../components/Form.css";
import { FaArrowLeft } from "react-icons/fa"; // Import from react-icons
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);
  const { login, user } = useAuth(); // Use `login` function from AuthContext

  // If user is already logged in, redirect them
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // ✅ Google Login for Returning Users
  const onGoogleLoginSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    console.log("Google login successful:", credentialResponse);

    try {
      if (!credentialResponse.credential) {
        throw new Error("No Google credential provided");
      }

      const response = await axios.post(
        "http://localhost:3000/api/auth/google",
        {
          credential: credentialResponse.credential, // ✅ Send credential to backend
        }
      );

      console.log("Google login success:", response.data);

      // Store tokens & user details
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("username", response.data.userName);

      login(response.data.userName);

      navigate("/"); // Redirect to home page
    } catch (error) {
      console.error("Google login error:", error);
      setLoginError("Google login failed. Please try again.");
    }
  };

  const onGoogleLoginFailure = () => {
    console.error("Google login failed");
    setLoginError("Google login failed. Please try again.");
  };

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        data
      );
      console.log("Login successful:", response.data);

      // Always remove old refresh token before storing a new one
      localStorage.removeItem("refreshToken");
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("username", response.data.userName);

      login(response.data.userName);

      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      setLoginError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <button className="back-arrow-button" onClick={() => navigate("/")}>
        <FaArrowLeft className="arrow-icon" /> {/* Using a modern icon */}
      </button>

      <h2>Login</h2>

      {loginError && <p className="error-message">{loginError}</p>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className={errors.email ? "error" : ""}
          />
          {errors.email && (
            <p className="error-message">{errors.email.message}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className={errors.password ? "error" : ""}
          />
          {errors.password && (
            <p className="error-message">{errors.password.message}</p>
          )}
        </div>

        <button type="submit">Login</button>
      </form>
      <div className="google-login-wrapper">
        <GoogleLogin
          onSuccess={onGoogleLoginSuccess}
          onError={onGoogleLoginFailure}
          theme="outline"
          size="large"
          shape="rectangular"
          width="100%" // Ensures full width
        />
      </div>
    </div>
  );
}
