import { useState, useRef } from "react";
import { authService, supplierFilesService } from "../../services/api-service";
import {
  SUPPLIER_FILE_CATEGORIES,
  getCategoryHints,
} from "../../utils/file-categories";

const SupplierFileUpload = ({
  supplierId,
  onFileUploaded,
  disabled = false,
  maxFileSize = 10, // MB
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("contact_rate");
  const fileInputRef = useRef(null);

  const allowedMimeTypes = {
    pdf: ["application/pdf"],
    image: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
  };

  const maxFileSizeBytes = maxFileSize * 1024 * 1024;

  // Get current category info
  const categoryInfo = SUPPLIER_FILE_CATEGORIES[selectedCategory];
  const categoryHints = getCategoryHints(selectedCategory, true);

  const validateFile = (file) => {
    // Check file type
    const isValidType = categoryInfo.allowedTypes.some((type) =>
      allowedMimeTypes[type]?.includes(file.type)
    );

    if (!isValidType) {
      return `The "${categoryInfo.label}" category only supports ${categoryHints.allowedTypesText}`;
    }

    // Check file size
    if (file.size > maxFileSizeBytes) {
      return `File size is too large (max ${maxFileSize}MB)`;
    }

    return null;
  };

  const uploadFile = async (file, label = "") => {
    const error = validateFile(file);
    if (error) {
      alert(error);
      return;
    }

    setUploading(true);

    try {
      const currentUser = authService.getCurrentUser();
      const uploadedFile = await supplierFilesService.uploadSupplierFile(
        supplierId,
        file,
        selectedCategory,
        label,
        currentUser?.username || "Unknown"
      );

      if (onFileUploaded) {
        onFileUploaded(uploadedFile);
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      alert(`File "${file.name}" uploaded successfully in category "${categoryInfo.label}"`);
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

    if (files.length === 1) {
      // Single file - ask for label
      const file = files[0];
      const label = prompt(
        `Label for file "${file.name}" (category: ${categoryInfo.label}):\n(e.g. "Contact Rate Jan 2025", "Price List Update")`,
        ""
      );

      if (label !== null) {
        uploadFile(file, label);
      }
    } else if (files.length <= 5) {
      // Small batch - upload normally
      files.forEach((file) => uploadFile(file));
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

    if (files.length === 1) {
      const file = files[0];
      const label = prompt(
        `Label for file "${file.name}" (category: ${categoryInfo.label}):\n(e.g. "Contact Rate Jan 2025")`,
        ""
      );

      if (label !== null) {
        uploadFile(file, label);
      }
    } else if (files.length <= 5) {
      files.forEach((file) => uploadFile(file));
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

  const getAcceptedTypes = () => {
    const types = [];
    if (categoryInfo.allowedTypes.includes("pdf")) types.push(".pdf");
    if (categoryInfo.allowedTypes.includes("image"))
      types.push(".jpg,.jpeg,.png,.gif,.webp");
    return types.join(",");
  };

  if (!supplierId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <span className="text-yellow-600">⚠️</span>
          <p className="text-yellow-800 text-sm">
            Please select a Supplier before uploading files
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="supplier-file-upload">
      {/* Category Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          File category <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          disabled={disabled || uploading}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        >
          {Object.values(SUPPLIER_FILE_CATEGORIES).map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>

        {/* Category Description */}
        <div className={`mt-2 p-3 rounded-lg ${categoryInfo.color} border`}>
          <p className="text-sm font-medium mb-1">{categoryInfo.description}</p>
          <p className="text-xs">
            Supports: {categoryHints.allowedTypesText} | Examples:{" "}
            {categoryHints.examples.slice(0, 2).join(", ")}
          </p>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={getAcceptedTypes()}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload Area */}
      <div
        className={`file-upload-area border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
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
          <div className="space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600">
              Uploading to "{categoryInfo.label}"...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Category Icon */}
            <div
              className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${categoryInfo.color}`}
            >
              <span className="text-3xl">{categoryInfo.icon}</span>
            </div>

            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Upload files to "{categoryInfo.label}"
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Click to select files or drag and drop them here
              </p>
              <p className="text-xs text-gray-500">
                Supports {categoryHints.allowedTypesText} (max {maxFileSize}MB)
              </p>
            </div>

            {/* Supported File Types */}
            <div className="flex justify-center space-x-6 text-xs text-gray-400">
              {categoryInfo.allowedTypes.includes("pdf") && (
                <span className="flex items-center space-x-1">
                  <span className="text-lg">📄</span>
                  <span>PDF</span>
                </span>
              )}
              {categoryInfo.allowedTypes.includes("image") && (
                <span className="flex items-center space-x-1">
                  <span className="text-lg">🖼️</span>
                  <span>JPG, PNG, GIF, WebP</span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-3 text-xs text-gray-500 space-y-1">
        <p>• You can upload multiple files at once</p>
        <p>• A single file will prompt for a label; multiple files keep their original names</p>
        <p>• Files will be stored in the "{categoryInfo.label}" category</p>
      </div>
    </div>
  );
};

export default SupplierFileUpload;
