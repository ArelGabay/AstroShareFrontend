import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "./Form.css";

const backend_url = import.meta.env.VITE_BACKEND_URL;

// Zod Validation
const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    userName: z.string().min(3, "Username must be at least 3 characters long"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Confirm Password is required"),
    profilePicture: z.any().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

const RegistrationForm: FC = () => {
  const navigate = useNavigate(); // Initialize navigate
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const profilePicture = watch("profilePicture") as unknown as File[];
  const inputFileRef: { current: HTMLInputElement | null } = { current: null };

  // Effect to update preview when file changes
  useEffect(() => {
    if (profilePicture && profilePicture.length > 0) {
      setSelectedFile(profilePicture[0]);
    }
  }, [profilePicture]);

  // Submit function
  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("userName", data.userName);
      formData.append("password", data.password);
      formData.append("confirmPassword", data.confirmPassword);
      if (profilePicture && profilePicture.length > 0) {
        formData.append("profilePicture", profilePicture[0]);
      }
      const response = await axios.post(
        backend_url + "/api/auth/register",
        formData
      );
      console.log("Registration successful:", response.data);
      navigate("/login");
    } catch (error: unknown) {
      if (
        axios.isAxiosError(error) &&
        error.response &&
        error.response.data &&
        error.response.data.error
      ) {
        alert(error.response.data.error);
      } else {
        alert("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Manually register file input (excluded from Zod)
  const { ref, ...rest } = register("profilePicture");

  return (
    <div className="page-container">
      <form
        className="form-container"
        onSubmit={handleSubmit(onSubmit)}
        encType="multipart/form-data"
      >
        <h2 className="astroshare-heading">Welcome to AstroShare</h2>

        {/* Profile Picture */}
        <div className="profile-pic-wrapper">
          <img
            src={
              selectedFile
                ? URL.createObjectURL(selectedFile)
                : backend_url + "/public/default_profile.png" // Local public folder
            }
            alt="Profile"
            className="profile-pic"
          />
          <FontAwesomeIcon
            icon={faImage}
            className="upload-icon"
            onClick={() => inputFileRef.current?.click()}
          />
        </div>

        {/* Hidden file input */}
        <input
          {...rest}
          ref={(e) => {
            ref(e);
            inputFileRef.current = e;
          }}
          type="file"
          accept="image/jpeg, image/png"
          style={{ display: "none" }}
        />

        {/* Email */}
        <div className="form-group">
          <label>Email</label>
          <input
            {...register("email")}
            type="email"
            placeholder="Enter your email"
            className={errors.email ? "error" : ""}
          />
          {errors.email && (
            <p className="error-message">{errors.email.message}</p>
          )}
        </div>

        {/* Username */}
        <div className="form-group">
          <label>User Name</label>
          <input
            {...register("userName")}
            type="text"
            placeholder="Choose a username"
            className={errors.userName ? "error" : ""}
          />
          {errors.userName && (
            <p className="error-message">{errors.userName.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="form-group">
          <label>Password</label>
          <input
            {...register("password")}
            type="password"
            placeholder="Enter your password"
            className={errors.password ? "error" : ""}
          />
          {errors.password && (
            <p className="error-message">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label>Confirm Password</label>
          <input
            {...register("confirmPassword")}
            type="password"
            placeholder="Re-enter your password"
            className={errors.confirmPassword ? "error" : ""}
          />
          {errors.confirmPassword && (
            <p className="error-message">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Sign up"}
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;
