import { useAuth } from "../context/useAuth";
import { Link } from "react-router-dom";
import "./Header.css"; // Import the CSS file

export default function Header() {
    const { user, logout } = useAuth();

    return (
        <header className="header">
            <nav className="nav">
                {!user ? (
                    // Show Home | Login | Register before login
                    <>
                        <Link to="/" className="link">Home</Link>
                        <Link to="/login" className="link">Login</Link>
                        <Link to="/register" className="link">Register</Link>
                    </>
                ) : (
                    // Show Profile | Logout after login
                    <>
                        <Link to="/profile" className="link">Profile</Link>
                        <button onClick={logout} className="button">Logout</button>
                    </>
                )}
            </nav>
        </header>
    );
}