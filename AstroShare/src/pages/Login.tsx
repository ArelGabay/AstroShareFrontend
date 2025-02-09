import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../context/useAuth"; // Corrected import path
import "../components/Form.css";

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
  const { login } = useAuth(); // Use `login` function from AuthContext

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await axios.post("http://localhost:3000/api/auth/login", data);
      console.log("Login successful:", response.data);

      login(response.data.name); // Update global state using login function
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("userEmail", response.data.email);

      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      setLoginError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      {loginError && <p className="error-message">{loginError}</p>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" {...register("email")} className={errors.email ? "error" : ""} />
          {errors.email && <p className="error-message">{errors.email.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" {...register("password")} className={errors.password ? "error" : ""} />
          {errors.password && <p className="error-message">{errors.password.message}</p>}
        </div>

        <button type="submit">Login</button>
      </form>
    </div>
  );
}