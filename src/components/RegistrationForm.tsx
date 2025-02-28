import { FC, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { useForm } from "react-hook-form";
import axios from "axios";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import "./Form.css"

interface FormDataType {
  profilePicture: File[];
  email: string;
  userName: string;
  password: string;
  confirmPassword: string;
}

const RegistrationForm: FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { register, handleSubmit, watch } = useForm<FormDataType>();
  const [profilePicture] = watch(["profilePicture"]);
  const inputFileRef: { current: HTMLInputElement | null } = { current: null };

  useEffect(() => {
    if (profilePicture) {
      setSelectedFile(profilePicture[0]);
    }
  }, [profilePicture]);

  const onSubmit = async (data: FormDataType) => {
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("userName", data.userName);
      formData.append("password", data.password);
      formData.append("confirmPassword", data.confirmPassword);
      if (data.profilePicture && data.profilePicture[0]) {
        formData.append("profilePicture", data.profilePicture[0]);
      }

      const response = await axios.post(
        "http://localhost:3000/api/auth/register",
        formData
      );

      console.log("Registration successful:", response.data);
      alert("Registration successful!");
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Registration failed. Please try again.");
    }
  };

  const { ref, ...rest } = register("profilePicture");
  
  const onGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    console.log("Google login successful:", credentialResponse);

    try {
        if (!credentialResponse.credential) {
            throw new Error("No Google credential provided");
        }

        const response = await axios.post("http://localhost:3000/api/auth/google", {
            credential: credentialResponse.credential, // Send credential to backend
        });

        console.log("Google login success:", response.data);
        
        // Store access token & refresh token
        console.log("Current refreshToken before saving:", localStorage.getItem("refreshToken"));
        localStorage.removeItem("refreshToken"); // Clear old refresh token
        localStorage.setItem("refreshToken", response.data.refreshToken); // Save new refresh token
        
    } catch (error) {
        console.error("Google login error:", error);
    }
};

  const onGoogleLoginFailure = () => {
      console.error("Google login failed");
      };

  return (
    <form
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      onSubmit={handleSubmit(onSubmit)}
      encType="multipart/form-data"
    >
      <div
        className="d-flex flex-column"
        style={{
          width: "20%",
          backgroundColor: "lightgray",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <img
            src={
              selectedFile
                ? URL.createObjectURL(selectedFile)
                : "http://localhost:3000/public/default_profile.png"
            }
            style={{
              width: "200px",
              height: "200px",
              alignSelf: "center",
              borderRadius: "50%",
            }}
            alt="Profile"
          />
          <FontAwesomeIcon
            onClick={() => inputFileRef.current?.click()}
            icon={faImage}
            className="fa-xl"
            style={{
              position: "absolute",
              bottom: "0",
              right: "0",
              cursor: "pointer",
            }}
          />
        </div>

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

        <label>Email:</label>
        <input {...register("email")} type="email" className="mb-3" required />

        <label>User Name:</label>
        <input
          {...register("userName")}
          type="text"
          className="mb-3"
          required
        />

        <label>Password:</label>
        <input
          {...register("password")}
          type="password"
          className="mb-3"
          required
        />

        <label>Confirm Password:</label>
        <input
          {...register("confirmPassword")}
          type="password"
          className="mb-3"
          required
        />

        <button type="submit" className="btn btn-outline-primary">
          Register
        </button>
        <div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={onGoogleLoginSuccess}
            onError={onGoogleLoginFailure}
            theme="outline"
            size="large"
            shape="rectangular"
            width="100%"  // Ensures full width
          />
        </div>
      </div>
    </form>
  );
};

export default RegistrationForm;
