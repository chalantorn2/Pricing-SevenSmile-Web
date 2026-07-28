import { useState, useRef } from "react";
import {
  Wallet,
  QrCode,
  Paperclip,
  AlertTriangle,
  UploadCloud,
} from "lucide-react";
import { authService, supplierFilesService } from "../../services/api-service";
import {
  SUPPLIER_FILE_CATEGORIES,
  getCategoryHints,
} from "../../utils/file-categories";

// Map category id -> lucide icon (keeps file-categories.js data untouched)
const CATEGORY_ICONS = {
  contact_rate: Wallet,
  qr_code: QrCode,
  general: Paperclip,
};

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
        `Label for file "${file.name}" (category: ${categoryInfo.label}):\n(e.g. "Contract Rate Jan 2025", "Price List Update")`,
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
        alert(`Finished uploading ${files.length} files`);
      } catch (error) {
        alert(`An error occurred: ${error.message}`);
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
        `Label for file "${file.name}" (category: ${categoryInfo.label}):\n(e.g. "Contract Rate Jan 2025")`,
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
        alert(`Finished uploading ${files.length} files`);
      } catch (error) {
        alert(`An error occurred: ${error.message}`);
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
      <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning-600 shrink-0" />
          <p className="text-warning-800 text-sm">
            Please select a Supplier before uploading files
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="supplier-file-upload space-y-3">
      {/* Category Selection — buttons so all options are visible */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          File category <span className="text-danger-600">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {Object.values(SUPPLIER_FILE_CATEGORIES).map((category) => {
            const Icon = CATEGORY_ICONS[category.id] || Paperclip;
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
                    : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
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

      {/* Upload Area — compact */}
      <div
        className={`file-upload-area border-2 border-dashed rounded-lg px-4 py-5 transition-all duration-200 ${
          dragOver
            ? "border-brand-500 bg-brand-50"
            : "border-gray-300 hover:border-gray-300"
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
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500"></div>
            <p className="text-sm text-gray-500">
              Uploading to "{categoryInfo.label}"...
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 text-center sm:text-left">
            <UploadCloud className="w-7 h-7 text-gray-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Drop files here or{" "}
                <span className="text-brand-600">click to upload</span>
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {categoryHints.allowedTypesText} · max {maxFileSize}MB · multiple
                files OK
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplierFileUpload;
