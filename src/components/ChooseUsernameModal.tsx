import React, { useState } from "react";
import "./ChooseUsernameModal.css";

interface ChooseUsernameModalProps {
  defaultUsername?: string;
  onSubmit: (username: string) => void;
  onCancel: () => void;
}

const ChooseUsernameModal: React.FC<ChooseUsernameModalProps> = ({
  defaultUsername = "",
  onSubmit,
  onCancel,
}) => {
  const [username, setUsername] = useState(defaultUsername);

  const handleSubmit = () => {
    const trimmed = username.trim();
    if (!trimmed) {
      alert("Please enter a valid username.");
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Choose a New Username</h2>
        <p>
          The default username derived from your email is already taken. Please
          choose a different username.
        </p>
        <input
          type="text"
          placeholder="Enter new username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="modal-input"
        />
        <div className="modal-buttons">
          <button onClick={handleSubmit} className="modal-submit">
            Submit
          </button>
          <button onClick={onCancel} className="modal-cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChooseUsernameModal;
