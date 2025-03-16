import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import "./UpdatePostModal.css"; // You can reuse the same CSS

interface AddPostFormData {
  title: string;
  content: string;
  photo: FileList;
}

interface AddPostProps {
  visible: boolean;
  onAdd: (newData: {
    title: string;
    content: string;
    photo?: File | null;
  }) => void;
  onCancel: () => void;
}

const AddPostModal: React.FC<AddPostProps> = ({ visible, onAdd, onCancel }) => {
  const { register, handleSubmit, watch, reset } = useForm<AddPostFormData>({
    defaultValues: { title: "", content: "" },
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Watch the file input for preview
  const watchedPhoto = watch("photo");
  useEffect(() => {
    if (watchedPhoto && watchedPhoto.length > 0) {
      setSelectedFile(watchedPhoto[0]);
    } else {
      setSelectedFile(null);
    }
  }, [watchedPhoto]);

  // Reset form when modal opens/closes
  useEffect(() => {
    reset({ title: "", content: "" });
    setSelectedFile(null);
  }, [reset, visible]);

  const onSubmit = (data: AddPostFormData) => {
    const newData: { title: string; content: string; photo?: File | null } = {
      title: data.title,
      content: data.content,
    };
    if (data.photo && data.photo.length > 0) {
      newData.photo = data.photo[0];
    }
    onAdd(newData);
  };

  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add New Post</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              {...register("title", { required: true })}
              placeholder="Enter post title"
            />
          </div>
          <div className="form-group">
            <label>Content</label>
            <textarea
              {...register("content", { required: true })}
              rows={4}
              placeholder="Enter post content"
            />
          </div>
          <div className="form-group">
            <label>Photo (optional)</label>
            <input type="file" accept="image/*" {...register("photo")} />
          </div>
          {selectedFile && (
            <div className="preview">
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Selected preview"
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                }}
              />
            </div>
          )}
          <div className="modal-buttons">
            <button type="submit">Add Post</button>
            <button
              type="button"
              onClick={() => {
                onCancel();
                reset();
                setSelectedFile(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPostModal;
