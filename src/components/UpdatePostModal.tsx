import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import "./UpdatePostModal.css";

interface UpdatePostFormData {
  title: string;
  content: string;
  photo: FileList;
  deletePhoto: boolean;
}

interface UpdatePostProps {
  visible: boolean;
  post: {
    _id: string;
    title: string;
    content: string;
    sender: string;
    pictureUrl?: string;
    likes?: string[];
  };
  onUpdate: (updatedData: {
    title: string;
    content: string;
    photo?: File | null;
    deletePhoto?: boolean;
  }) => void;
  onCancel: () => void;
}

const UpdatePostModal: React.FC<UpdatePostProps> = ({
  visible,
  post,
  onUpdate,
  onCancel,
}) => {
  const { register, handleSubmit, watch, reset } = useForm<UpdatePostFormData>({
    defaultValues: {
      title: post.title,
      content: post.content,
      deletePhoto: false,
    },
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Watch the file input and the checkbox
  const watchedPhoto = watch("photo");
  const watchedDeletePhoto = watch("deletePhoto");

  useEffect(() => {
    if (watchedPhoto && watchedPhoto.length > 0) {
      setSelectedFile(watchedPhoto[0]);
    } else {
      setSelectedFile(null);
    }
  }, [watchedPhoto]);

  // Reset form when post changes.
  useEffect(() => {
    reset({ title: post.title, content: post.content, deletePhoto: false });
    setSelectedFile(null);
  }, [post, reset]);

  const onSubmit = (data: UpdatePostFormData) => {
    const updatedData: {
      title: string;
      content: string;
      photo?: File | null;
      deletePhoto?: boolean;
    } = {
      title: data.title,
      content: data.content,
      deletePhoto: data.deletePhoto,
    };
    if (data.photo && data.photo.length > 0) {
      updatedData.photo = data.photo[0];
    }
    onUpdate(updatedData);
  };

  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Update Post</h2>
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
            <input
              type="file"
              accept="image/*"
              {...register("photo")}
              disabled={!!watchedDeletePhoto}
            />
          </div>
          {post.pictureUrl && (
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  {...register("deletePhoto")}
                  disabled={watchedPhoto && watchedPhoto.length > 0}
                />
                Remove current photo
              </label>
            </div>
          )}
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
            <button type="submit">Update</button>
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

export default UpdatePostModal;
