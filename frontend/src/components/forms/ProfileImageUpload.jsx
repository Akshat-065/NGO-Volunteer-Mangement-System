import { useEffect, useRef, useState } from "react";
import { Camera, Upload, X } from "lucide-react";
import api from "../../services/api";
import Button from "../ui/Button";
import UserAvatar from "../ui/UserAvatar";
import { classNames } from "../../utils/formatters";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ProfileImageUpload = ({
  name,
  avatarUrl = "",
  onUploaded,
  uploadPath = "/profile/avatar",
  className = ""
}) => {
  const inputRef = useRef(null);
  const objectUrlRef = useRef("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(avatarUrl || "");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(avatarUrl || "");
    }
  }, [avatarUrl, selectedFile]);

  useEffect(
    () => () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    },
    []
  );

  const updatePreview = (file) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setPreviewUrl(objectUrl);
  };

  const resetSelection = (nextPreview = avatarUrl || "") => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = "";
    }

    setSelectedFile(null);
    setPreviewUrl(nextPreview);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Profile image must be 5MB or smaller.");
      return;
    }

    setError("");
    setSelectedFile(file);
    updatePreview(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Choose an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", selectedFile);

    try {
      setIsUploading(true);
      setError("");

      const { data } = await api.post(uploadPath, formData);
      const nextAvatarUrl = data?.avatarUrl;

      if (!nextAvatarUrl) {
        throw new Error("The upload did not return an image URL.");
      }

      resetSelection(nextAvatarUrl);
      onUploaded?.(nextAvatarUrl, data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to upload profile image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setError("");
    resetSelection(avatarUrl || "");
  };

  return (
    <div className={classNames("flex flex-col gap-4 sm:flex-row sm:items-center", className)}>
      <UserAvatar name={name} avatarUrl={previewUrl} size="lg" />

      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-[0.24em] text-slate/70">Profile image</p>
        <p className="mt-1 text-sm text-slate">Choose an image to preview it before uploading.</p>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" className="gap-2" onClick={() => inputRef.current?.click()}>
            <Camera size={16} />
            Choose image
          </Button>

          <Button
            type="button"
            className="gap-2"
            isLoading={isUploading}
            disabled={!selectedFile || isUploading}
            onClick={handleUpload}
          >
            <Upload size={16} />
            Upload
          </Button>

          {selectedFile ? (
            <Button type="button" variant="ghost" className="gap-2" onClick={handleClear}>
              <X size={16} />
              Clear
            </Button>
          ) : null}
        </div>

        {selectedFile ? (
          <p className="mt-2 text-xs text-slate">Selected: {selectedFile.name}</p>
        ) : null}

        {error ? <p className="mt-2 text-sm text-coral">{error}</p> : null}
      </div>
    </div>
  );
};

export default ProfileImageUpload;
