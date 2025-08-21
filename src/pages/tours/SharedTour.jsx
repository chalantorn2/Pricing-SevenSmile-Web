import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toursService } from "../../services/api-service";
import TourDetails from "../../components/tours/TourDetails";

const SharedTour = () => {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTour();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchTour = async () => {
    try {
      setLoading(true);
      const tours = await toursService.getAllTours();
      const foundTour = tours.find((t) => String(t.id) === String(id));
      if (foundTour) {
        setTour(foundTour);
      } else {
        setError("ไม่พบข้อมูลทัวร์ที่ต้องการ");
      }
    } catch (error) {
      console.error("Error fetching tour:", error);
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูลทัวร์...</p>
        </div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">😞</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ไม่พบข้อมูล</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            กลับไปยังระบบ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h1
                className="truncate text-xl font-semibold text-gray-900"
                title={tour.tour_name}
              >
                {tour.tour_name || "รายละเอียดทัวร์"}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                {!!tour.supplier_name && (
                  <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-gray-700 ring-1 ring-inset ring-gray-200">
                    Supplier: {tour.supplier_name}
                  </span>
                )}
                {!!tour.departure_from && (
                  <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-gray-700 ring-1 ring-inset ring-gray-200">
                    ออกจาก: {tour.departure_from}
                  </span>
                )}
                {!!tour.pier && (
                  <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-gray-700 ring-1 ring-inset ring-gray-200">
                    ท่าเรือ: {tour.pier}
                  </span>
                )}
              </div>
            </div>
            <Link
              to="/"
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              เข้าสู่ระบบ →
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden ring-1 ring-black/5">
          <div className="p-6">
            <TourDetails
              tour={tour}
              showActions={false}
              showHeader={false}
              className="shared-tour-details"
            />
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-500">
                <p>Seven Smile Tour And Ticket</p>
                <p>ระบบจัดการราคาทัวร์</p>
              </div>
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                🔒 เข้าสู่ระบบเพื่อจัดการ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedTour;
