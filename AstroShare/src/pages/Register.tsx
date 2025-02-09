import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import "../components/Form.css"; // Ensure this is the correct path

// Define validation schema
const registerSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"), // Fix: Add email
    age: z.number({ invalid_type_error: "Age is required" }).min(18, "Age must be at least 18"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    verifyPassword: z.string().min(6, "Please confirm your password"),
  }).refine((data) => data.password === data.verifyPassword, {
    message: "Passwords do not match",
    path: ["verifyPassword"],
  });
  

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const navigate = useNavigate();

  const onSubmit = async (data: RegisterForm) => {
    try {
      const response = await axios.post("http://localhost:3000/api/auth/register", data);
      console.log("Registration successful:", response.data);
  
      // Store user data
      localStorage.setItem("userName", response.data.name); // Save name
      localStorage.setItem("userEmail", response.data.email);
  
      navigate("/");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };
  
  return (
    <div className="form-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit(onSubmit)}>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" {...register("email")} className={errors.email ? "error" : ""} />
          {errors.email && <p className="error-message">{errors.email.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input id="name" type="text" {...register("name")} className={errors.name ? "error" : ""} />
          {errors.name && <p className="error-message">{errors.name.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input id="age" type="number" {...register("age", { valueAsNumber: true })} className={errors.age ? "error" : ""} />
          {errors.age && <p className="error-message">{errors.age.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" {...register("password")} className={errors.password ? "error" : ""} />
          {errors.password && <p className="error-message">{errors.password.message}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="verifyPassword">Verify Password</label>
          <input id="verifyPassword" type="password" {...register("verifyPassword")} className={errors.verifyPassword ? "error" : ""} />
          {errors.verifyPassword && <p className="error-message">{errors.verifyPassword.message}</p>}
        </div>

        <button type="submit">Register</button>
      </form>
    </div>
  );
}