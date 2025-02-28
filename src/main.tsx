import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext"; // Ensure correct path
import { GoogleOAuthProvider } from '@react-oauth/google'; // Import GoogleOAuthProvider

ReactDOM.createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId = "183240496566-a7vk6nrall203bnnncilbgcs2a4jbin5.apps.googleusercontent.com">
    <BrowserRouter>
      <AuthProvider> 
        <App />
      </AuthProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>
);