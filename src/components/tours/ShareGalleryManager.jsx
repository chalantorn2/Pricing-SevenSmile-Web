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
      alert("เกิดข้อผิดพลาดในการค้นหา");
    } finally {
      setLoading(false);
    }
  };

  const handleShareGallery = async (sourceTour) => {
    if (
      !window.confirm(
        `คุณต้องการนำรูป Gallery จาก "${sourceTour.tour_name}" มาใช้ใช่หรือไม่?\n\n` +
          `จะได้รูป: ${sourceTour.gallery_count} รูป`
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

      alert(`✅ นำรูป Gallery มาใช้สำเร็จ ${result.shared_count} รูป`);

      if (onGalleryShared) {
        onGalleryShared();
      }

      // Clear search
      setSearchTerm("");
      setSearchResults([]);
    } catch (error) {
      console.error("Share error:", error);
      alert("เกิดข้อผิดพลาดในการแชร์รูป: " + error.message);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
        <span className="mr-2">🔗</span>
        เอารูป Gallery จากทัวร์อื่นมาใช้
      </h3>

      {/* Search Box */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="ค้นหาทัวร์ที่มีรูป Gallery (พิมพ์อย่างน้อย 2 ตัวอักษร)"
          value={searchTerm}
          onChange={(e) => {
            const term = e.target.value;
            setSearchTerm(term);
            setTimeout(() => handleSearch(term), 500);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          autoFocus
        />
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-700 mb-2">
            🎯 พบทัวร์ที่มีรูป Gallery: {searchResults.length} ทัวร์
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
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span>📸 Gallery: {tour.gallery_count} รูป</span>
                    {tour.supplier_name && <span>🏢 {tour.supplier_name}</span>}
                    <span>
                      📅 {new Date(tour.updated_at).toLocaleDateString("th-TH")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleShareGallery(tour)}
                  disabled={sharing}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {sharing ? "กำลังนำมา..." : "เลือกทัวร์นี้"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {searchTerm.length >= 2 && !loading && searchResults.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          😔 ไม่พบทัวร์ที่มีรูป Gallery สำหรับ "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default ShareGalleryManager;
