import { useState, useRef } from "react";
import { Paperclip, UploadCloud } from "lucide-react";
import { authService, filesService } from "../../services/api-service";
import {
  TOUR_FILE_CATEGORIES,
  getCategoryHints,
} from "../../utils/file-categories";
import ShareGalleryManager from "./ShareGalleryManager";

const TourFileUpload = ({
  tourId,
  onFileUploaded,
  onGalleryShared,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("general");
  const fileInputRef = useRef(null);

  const allowedTypes = {
    "application/pdf": "pdf",
    "image/jpeg": "image",
    "image/jpg": "image",
    "image/png": "image",
    "image/gif": "image",
    "image/webp": "image",
  };

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  // Get current category info
  const categoryInfo = TOUR_FILE_CATEGORIES[selectedCategory];
  const categoryHints = getCategoryHints(selectedCategory, false);

  const validateFile = (file) => {
    if (!allowedTypes[file.type]) {
      return "Only PDF and image files are supported (JPG, PNG, GIF, WebP)";
    }

    if (file.size > maxFileSize) {
      return "File size is too large (max 10MB)";
    }

    // Validate against category restrictions
    const fileType = file.type.includes("image") ? "image" : "pdf";
    if (!categoryInfo.allowedTypes.includes(fileType)) {
      return `The "${categoryInfo.label}" category only supports ${categoryHints.allowedTypesText}`;
    }

    return null;
  };

  const uploadFile = async (file) => {
    const error = validateFile(file);
    if (error) {
      alert(error);
      return;
    }

    setUploading(true);

    try {
      const currentUser = authService.getCurrentUser();
      const uploadedFile = await filesService.uploadTourFile(
        tourId,
        file,
        selectedCategory,
        currentUser?.username || "Unknown"
      );

      if (onFileUploaded) {
        onFileUploaded(uploadedFile);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // alert(`File "${file.name}" uploaded successfully in category "${categoryInfo.label}"`);
    } catch (error) {
      console.error("Upload error:", error);
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  // Added before the handleFileSelect function
  const uploadFilesSequentially = async (files) => {
    const results = [];
    const BATCH_SIZE = 5;
    const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds

    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);

      console.log(
        `🔄 Uploading batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(
          files.length / BATCH_SIZE
        )}`
      );

      // Upload one batch at a time
      const batchPromises = batch.map((file) => uploadFile(file));
      const batchResults = await Promise.all(batchPromises);

      results.push(...batchResults);

      // Wait before uploading the next batch
      if (i + BATCH_SIZE < files.length) {
        console.log(
          `⏳ Waiting ${DELAY_BETWEEN_BATCHES / 1000}s before next batch...`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, DELAY_BETWEEN_BATCHES)
        );
      }
    }

    return results;
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);

    if (files.length > 10) {
      const confirmed = confirm(
        `You are about to upload ${files.length} files\n` +
          `The system will upload 5 files at a time to prevent issues\n` +
          `Estimated time: ${Math.ceil(files.length / 5) * 2} seconds\n\n` +
          `Do you want to continue?`
      );

      if (!confirmed) return;
    }

    if (files.length <= 5) {
      // Small batch - upload normally
      files.forEach(uploadFile);
    } else {
      // Large batch - upload sequentially
      try {
        setUploading(true);
        await uploadFilesSequentially(files);
        alert(`✅ Finished uploading ${files.length} files`);
      } catch (error) {
        alert(`❌ An error occurred: ${error.message}`);
      } finally {
        setUploading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setDragOver(false);

    const files = Array.from(event.dataTransfer.files);

    if (files.length > 10) {
      const confirmed = confirm(
        `You are about to upload ${files.length} files\n` +
          `The system will upload 5 files at a time to prevent issues\n` +
          `Estimated time: ${Math.ceil(files.length / 5) * 2} seconds\n\n` +
          `Do you want to continue?`
      );

      if (!confirmed) return;
    }

    if (files.length <= 5) {
      files.forEach(uploadFile);
    } else {
      try {
        setUploading(true);
        await uploadFilesSequentially(files);
        alert(`✅ Finished uploading ${files.length} files`);
      } catch (error) {
        alert(`❌ An error occurred: ${error.message}`);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getAcceptString = () => {
    if (
      categoryInfo.allowedTypes.includes("image") &&
      categoryInfo.allowedTypes.includes("pdf")
    ) {
      return ".pdf,.jpg,.jpeg,.png,.gif,.webp";
    } else if (categoryInfo.allowedTypes.includes("pdf")) {
      return ".pdf";
    } else {
      return ".jpg,.jpeg,.png,.gif,.webp";
    }
  };

  return (
    <div className="tour-file-upload space-y-3">
      {/* Category Selection — buttons so all options are visible */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          File category <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(TOUR_FILE_CATEGORIES).map((category) => {
            const Icon = category.icon || Paperclip;
            const active = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                disabled={disabled || uploading}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  active
                    ? `${category.color} border-current`
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{category.label}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 text-xs text-gray-500">
          {categoryInfo.description} · Supports {categoryHints.allowedTypesText}
        </p>
      </div>

      {/* Share Gallery Manager - shown only when Gallery is selected */}
      {selectedCategory === "gallery" && (
        <ShareGalleryManager
          currentTourId={tourId}
          onGalleryShared={onGalleryShared}
        />
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={getAcceptString()}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload Area — compact */}
      <div
        className={`file-upload-area border-2 border-dashed rounded-lg px-4 py-5 transition-all duration-200 ${
          dragOver
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        } ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:bg-gray-50"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600">
              Uploading to "{categoryInfo.label}"...
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 text-center sm:text-left">
            <UploadCloud className="w-7 h-7 text-gray-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Drop files here or{" "}
                <span className="text-blue-600">click to upload</span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {categoryHints.allowedTypesText} · max 10MB · multiple files OK
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TourFileUpload;
