import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { RocketOutlined } from "@ant-design/icons"; // Using Rocket icon
import "./UpdatePostModal.css"; // Reusing the same CSS

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
  const { register, handleSubmit, watch, reset, setValue } =
    useForm<AddPostFormData>({
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

  const currentContent = watch("content") || "";

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

  // Generate function using Gemini AI.
  const handleGenerate = async () => {
    const currentContent = watch("content") || "";
    console.log("Generate clicked. Current content:", currentContent);
    const prompt = `Analyze the following content and determine if it mentions a specific place.
If a place is mentioned, return a JSON object with two keys:
  "title": a catchy title about that place, and
  "content": an improved version of the original content and cool fact about that place.
If no specific place is mentioned, return a JSON object with two keys (dont mention place not being mentioned):
  "title": a catchy title, and
  "content": an improved version of the original content.
Content: "${currentContent}".
Return only a valid JSON object.`;

    try {
      const response = await axios.get(
        "http://localhost:3000/api/ai/generate",
        {
          params: { prompt },
          headers: {
            Authorization: `JWT ${localStorage.getItem("accessToken") || ""}`,
          },
        }
      );
      console.log("AI response data:", response.data);
      const generatedText = response.data.description;
      console.log("Generated text:", generatedText);
      // Remove code block markers if present
      let cleanedText = generatedText.trim();
      if (cleanedText.startsWith("```json") && cleanedText.endsWith("```")) {
        cleanedText = cleanedText.substring(7, cleanedText.length - 3).trim();
      }
      try {
        const jsonResult = JSON.parse(cleanedText);
        if (jsonResult.title && jsonResult.content) {
          setValue("title", jsonResult.title);
          setValue("content", jsonResult.content);
        } else {
          setValue("title", cleanedText);
          setValue("content", cleanedText);
        }
      } catch (parseError) {
        console.error("Error parsing generated text as JSON:", parseError);
        setValue("title", cleanedText);
        setValue("content", cleanedText);
      }
    } catch (error) {
      console.error("Error generating post content:", error);
    }
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
          <div className="form-group content-group">
            <div className="content-header">
              <label>Content</label>
              <button
                type="button"
                className="generate-btn"
                onClick={handleGenerate}
                title="Generate a catchy title and cool fact based on your content"
                disabled={currentContent.trim() === ""}
              >
                <RocketOutlined style={{ fontSize: "16px" }} />
              </button>
            </div>
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
