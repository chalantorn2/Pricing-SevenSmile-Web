import { useState } from "react";
import { filesService } from "../../services/api-service";

const ShareGalleryManager = ({ currentTourId, onGalleryShared }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const handleSearch = async (term = searchTerm) => {
    if (!term.trim() || term.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const tours = await filesService.searchToursWithGallery(term);
      // Filter out current tour
      const filteredTours = tours.filter(
        (tour) => parseInt(tour.id) !== parseInt(currentTourId)
      );
      setSearchResults(filteredTours);
    } catch (error) {
      console.error("Search error:", error);
      alert("An error occurred while searching");
    } finally {
      setLoading(false);
    }
  };

  const handleShareGallery = async (sourceTour) => {
    if (
      !window.confirm(
        `Do you want to use the Gallery images from "${sourceTour.tour_name}"?\n\n` +
          `You will get: ${sourceTour.gallery_count} images`
      )
    ) {
      return;
    }

    try {
      setSharing(true);
      const result = await filesService.shareGalleryFiles(
        sourceTour.id,
        currentTourId
      );

      alert(`Gallery images added successfully: ${result.shared_count} images`);

      if (onGalleryShared) {
        onGalleryShared();
      }

      // Clear search
      setSearchTerm("");
      setSearchResults([]);
    } catch (error) {
      console.error("Share error:", error);
      alert("An error occurred while sharing images: " + error.message);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        Use Gallery images from another tour
      </h3>

      {/* Search Box */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search tours with Gallery images (type at least 2 characters)"
          value={searchTerm}
          onChange={(e) => {
            const term = e.target.value;
            setSearchTerm(term);
            setTimeout(() => handleSearch(term), 500);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          autoFocus
        />
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-700 mb-2">
            Found tours with Gallery images: {searchResults.length} tours
          </p>

          {searchResults.map((tour) => (
            <div
              key={tour.id}
              className="bg-gray-50 border border-gray-200 rounded-lg p-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {tour.tour_name}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span>Gallery: {tour.gallery_count} images</span>
                    {tour.supplier_name && <span>{tour.supplier_name}</span>}
                    <span>
                      {new Date(tour.updated_at).toLocaleDateString("en-US")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleShareGallery(tour)}
                  disabled={sharing}
                  className="px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {sharing ? "Adding..." : "Select this tour"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {searchTerm.length >= 2 && !loading && searchResults.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No tours with Gallery images found for "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default ShareGalleryManager;
