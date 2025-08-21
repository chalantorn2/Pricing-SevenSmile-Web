import { useState } from "react";

const FileGallery = ({ files, getFileUrl, title = "รูปภาพ" }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!files || files.length === 0) return null;

  const handleImageClick = (file) => {
    setSelectedImage(file);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <div className="file-gallery-section">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
          <span className="mr-2">🖼️</span>
          {title} ({files.length} รูป)
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
              onClick={() => handleImageClick(file)}
            >
              <img
                src={getFileUrl(file)}
                alt={file.original_name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 z-10 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <img
              src={getFileUrl(selectedImage)}
              alt={selectedImage.original_name}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-2 left-2 bg-black/50 text-white px-3 py-1 rounded text-sm">
              {selectedImage.original_name}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileGallery;
