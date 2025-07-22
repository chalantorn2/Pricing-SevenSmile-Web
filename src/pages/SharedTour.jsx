import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toursService } from "../services/api-service";

const SharedTour = () => {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTour();
  }, [id]);

  const fetchTour = async () => {
    try {
      setLoading(true);
      const tours = await toursService.getAllTours();
      const foundTour = tours.find((t) => t.id === id);

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("th-TH").format(price);
  };

  const isExpired = (endDate) => {
    return new Date(endDate) < new Date();
  };

  const getNotesWithExpiry = (tour) => {
    let notes = tour.notes || "";
    if (tour.park_fee_included) {
      notes = "ราคา Net นี้ รวมค่าอุทยานแล้ว" + (notes ? ` | ${notes}` : "");
    } else {
      notes = "ราคา Net นี้ ยังไม่รวมค่าอุทยาน" + (notes ? ` | ${notes}` : "");
    }

    if (isExpired(tour.end_date)) {
      notes += " | ⚠️ หมดอายุแล้ว กรุณาต่ออายุ";
    }

    return notes;
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
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-blue-600">Contact Rate</h1>
              <span className="text-sm text-gray-500">• รายละเอียดทัวร์</span>
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
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Tour Header */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {tour.tour_name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center">
                <span className="mr-1">🏢</span>
                {tour.sub_agent_name}
              </span>
              {tour.departure_from && (
                <span className="flex items-center">
                  <span className="mr-1">📍</span>
                  ออกจาก {tour.departure_from}
                </span>
              )}
              {tour.pier && (
                <span className="flex items-center">
                  <span className="mr-1">⚓</span>
                  ท่าเรือ {tour.pier}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Pricing - Highlight */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">💰</span>
                ราคา Net (บาท)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    ราคาผู้ใหญ่
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    ฿{formatPrice(tour.adult_price)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    ราคาเด็ก
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    ฿{formatPrice(tour.child_price)}
                  </p>
                </div>
              </div>
            </div>

            {/* Tour Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Date Range */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">📅</span>
                    ช่วงเวลาที่ราคานี้ใช้ได้
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">
                        วันที่เริ่มต้น:
                      </span>
                      <span className="text-sm text-gray-900 font-medium">
                        {formatDate(tour.start_date)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">
                        วันที่สิ้นสุด:
                      </span>
                      <span className="text-sm text-gray-900 font-medium">
                        {formatDate(tour.end_date)}
                      </span>
                    </div>
                    {isExpired(tour.end_date) && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-red-500">⚠️</span>
                          <span className="text-red-700 text-sm font-medium">
                            ราคานี้หมดอายุแล้ว กรุณาติดต่อสำหรับราคาล่าสุด
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub Agent Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">🏢</span>
                    ข้อมูล Sub Agent
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-500">
                        ชื่อ:
                      </span>
                      <span className="text-sm text-gray-900 text-right">
                        {tour.sub_agent_name}
                      </span>
                    </div>
                    {tour.address && (
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-500">
                          ที่อยู่:
                        </span>
                        <span className="text-sm text-gray-900 text-right max-w-xs">
                          {tour.address}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Contact Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">📞</span>
                    ช่องทางการติดต่อ
                  </h3>
                  <div className="space-y-3">
                    {tour.phone && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">
                          เบอร์โทร:
                        </span>
                        <a
                          href={`tel:${tour.phone}`}
                          className="text-sm text-blue-600 hover:underline font-medium"
                        >
                          {tour.phone}
                        </a>
                      </div>
                    )}
                    {tour.line && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">
                          Line:
                        </span>
                        <span className="text-sm text-gray-900 font-medium">
                          {tour.line}
                        </span>
                      </div>
                    )}
                    {tour.facebook && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">
                          Facebook:
                        </span>
                        <a
                          href={tour.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline font-medium max-w-xs truncate"
                        >
                          {tour.facebook}
                        </a>
                      </div>
                    )}
                    {tour.whatsapp && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500">
                          WhatsApp:
                        </span>
                        <a
                          href={`https://wa.me/${tour.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-green-600 hover:underline font-medium"
                        >
                          {tour.whatsapp}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* System Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">ℹ️</span>
                    ข้อมูลระบบ
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">
                        อัพเดทเมื่อ:
                      </span>
                      <span className="text-sm text-gray-900">
                        {new Date(tour.updated_at).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">
                        อัพเดทโดย:
                      </span>
                      <span className="text-sm text-gray-900">
                        {tour.updated_by}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📝</span>
                หมายเหตุ
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {getNotesWithExpiry(tour)}
                </p>
              </div>
            </div>
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
                🔑 เข้าสู่ระบบเพื่อจัดการ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedTour;
