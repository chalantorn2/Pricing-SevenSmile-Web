import { useState } from "react";

const SharedGalleryGroup = ({
  sourceTourId,
  sourceTourName,
  files,
  onUnshareAll,
  onUnshareFile,
  onViewFile,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleUnshareAll = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      window.confirm(
        `Do you want to unshare all images (${files.length} images) from "${sourceTourName}"?\n\n` +
          `This action cannot be undone!`
      )
    ) {
      onUnshareAll(sourceTourId);
    }
  };

  const handleUnshareFile = (e, file) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm("Do you want to unshare this image?")) {
      onUnshareFile(file);
    }
  };

  const handleToggleExpand = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleViewFile = (e, file) => {
    e.preventDefault();
    e.stopPropagation();
    onViewFile(file, false);
  };

  return (
    <div className="bg-brand-50 border border-brand-200 rounded-lg p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleToggleExpand}
            className="flex items-center space-x-2 text-brand-700 hover:text-brand-800 transition-colors"
          >
            <span className="text-lg">{isExpanded ? "🔽" : "▶️"}</span>
            <span className="font-medium">
              From tour "{sourceTourName}" ({files.length} images)
            </span>
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleToggleExpand}
            className="px-3 py-1 text-sm bg-brand-600 text-white rounded hover:bg-brand-700 transition-colors"
          >
            {isExpanded ? "Collapse" : "View images"}
          </button>
          <button
            type="button"
            onClick={handleUnshareAll}
            className="px-3 py-1 text-sm bg-danger-600 text-white rounded hover:bg-danger-700 transition-colors"
          >
            🗑️ Remove all
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="space-y-2 border-t border-brand-200 pt-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 "
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">🖼️</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {file.original_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {file.file_size_formatted} • Shared from ID: {sourceTourId}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={(e) => handleViewFile(e, file)}
                  className="px-2 py-1 text-brand-600 hover:bg-brand-100 rounded text-sm"
                >
                  👁️ View
                </button>
                <button
                  type="button"
                  onClick={(e) => handleUnshareFile(e, file)}
                  className="px-2 py-1 text-danger-600 hover:bg-danger-50 rounded text-sm"
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedGalleryGroup;
