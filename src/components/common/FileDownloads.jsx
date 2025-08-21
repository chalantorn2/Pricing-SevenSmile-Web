import {
  getTourCategoryInfo,
  getSupplierCategoryInfo,
} from "../../utils/file-categories";

const FileDownloads = ({
  files,
  getFileUrl,
  title,
  isSupplier = false,
  showCategory = true,
}) => {
  if (!files || files.length === 0) return null;

  const handleFileView = (file) => {
    const fileUrl = getFileUrl(file);
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  const getCategoryInfo = (categoryId) => {
    return isSupplier
      ? getSupplierCategoryInfo(categoryId)
      : getTourCategoryInfo(categoryId);
  };

  // Group files by category if showCategory is true
  const groupedFiles = showCategory
    ? files.reduce((acc, file) => {
        const category = file.file_category || "general";
        if (!acc[category]) acc[category] = [];
        acc[category].push(file);
        return acc;
      }, {})
    : { all: files };

  return (
    <div className="file-downloads-section space-y-4">
      <h3 className="text-sm font-semibold text-gray-900 flex items-center">
        <span className="mr-2">📁</span>
        {title} ({files.length} ไฟล์)
      </h3>

      {Object.entries(groupedFiles).map(([categoryId, categoryFiles]) => {
        const categoryInfo = showCategory ? getCategoryInfo(categoryId) : null;

        return (
          <div key={categoryId} className="space-y-2">
            {showCategory && categoryId !== "all" && (
              <h4
                className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${categoryInfo.color}`}
              >
                {categoryInfo.icon} {categoryInfo.label} ({categoryFiles.length}
                )
              </h4>
            )}

            <div className="space-y-2">
              {categoryFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <span className="text-lg flex-shrink-0">
                      {file.file_type === "pdf" ? "📄" : "🖼️"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.label || file.original_name}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{file.file_size_formatted}</span>
                        <span>•</span>
                        <span>
                          {new Date(file.uploaded_at).toLocaleDateString(
                            "th-TH"
                          )}
                        </span>
                        {file.file_type && (
                          <>
                            <span>•</span>
                            <span className="uppercase">{file.file_type}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleFileView(file)}
                    className="flex-shrink-0 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
                  >
                    {file.file_type === "pdf" ? "เปิด" : "ดู"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FileDownloads;
