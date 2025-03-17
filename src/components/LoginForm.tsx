import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import "../components/Form.css";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const onGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) throw new Error("No Google credential");

      const response = await axios.post("http://localhost:3000/api/auth/google", {
        credential: credentialResponse.credential,
      });

      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("username", response.data.userName);
      localStorage.setItem("profilePictureUrl", response.data.profilePictureUrl);

      login({
        userName: response.data.userName,
        profilePictureUrl: response.data.profilePictureUrl,
        isGoogleUser: true,
      });

      navigate("/");
    } catch (error) {
      console.error("Google login error:", error);
      setLoginError("Google login failed. Please try again.");
    }
  };

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/api/auth/login", data);

      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("username", response.data.userName);
      localStorage.setItem("profilePictureUrl", response.data.profilePictureUrl);

      login({
        userName: response.data.userName,
        profilePictureUrl: response.data.profilePictureUrl,
        isGoogleUser: false,
      });

      navigate("/");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setLoginError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">

      {/* Welcome Message */}
    <h1 className="astroshare-welcome">Welcome to AstroShare</h1>

      {loginError && <p className="error-message">{loginError}</p>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...register("email")}
            className={errors.email ? "error" : ""}
          />
          {errors.email && <p className="error-message">{errors.email.message}</p>}
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
          {errors.password && <p className="error-message">{errors.password.message}</p>}
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
    </div>
  );
};

export default LoginForm;