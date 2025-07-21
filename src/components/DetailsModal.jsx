import { Link } from "react-router-dom";

const DetailsModal = ({ isOpen, onClose, tour }) => {
  if (!isOpen || !tour) return null;

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

  return (
    <div className="modal-backdrop">
      <div className="modal-overlay">
        <div className="modal-content bg-white rounded-lg shadow-xl w-full max-w-4xl">
          {/* Header */}
          <div className="modal-header sticky top-0 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              รายละเอียดทัวร์
            </h2>
            <div className="flex items-center space-x-3">
              <Link
                to={`/edit/${tour.id}`}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                onClick={onClose}
              >
                ✏️ แก้ไข
              </Link>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
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
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
            {/* Tour Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    ข้อมูลทัวร์
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <span className="text-sm font-medium text-gray-500">
                        ชื่อทัวร์:
                      </span>
                      <span className="col-span-2 text-sm text-gray-900">
                        {tour.tour_name}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <span className="text-sm font-medium text-gray-500">
                        ออกจาก:
                      </span>
                      <span className="col-span-2 text-sm text-gray-900">
                        {tour.departure_from || "-"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <span className="text-sm font-medium text-gray-500">
                        ท่าเรือ:
                      </span>
                      <span className="col-span-2 text-sm text-gray-900">
                        {tour.pier || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    ราคา Net (บาท)
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <span className="text-sm font-medium text-gray-500">
                        ราคาผู้ใหญ่:
                      </span>
                      <span className="col-span-2 text-lg font-semibold text-green-600">
                        ฿{formatPrice(tour.adult_price)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <span className="text-sm font-medium text-gray-500">
                        ราคาเด็ก:
                      </span>
                      <span className="col-span-2 text-lg font-semibold text-green-600">
                        ฿{formatPrice(tour.child_price)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    ช่วงเวลาที่ราคานี้ใช้ได้
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <span className="text-sm font-medium text-gray-500">
                        วันที่เริ่มต้น:
                      </span>
                      <span className="col-span-2 text-sm text-gray-900">
                        {formatDate(tour.start_date)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <span className="text-sm font-medium text-gray-500">
                        วันที่สิ้นสุด:
                      </span>
                      <span className="col-span-2 text-sm text-gray-900">
                        {formatDate(tour.end_date)}
                      </span>
                    </div>
                    {isExpired(tour.end_date) && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-red-500">⚠️</span>
                          <span className="text-red-700 text-sm font-medium">
                            ราคานี้หมดอายุแล้ว กรุณาต่ออายุ
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Sub Agent Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    ข้อมูล Sub Agent
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <span className="text-sm font-medium text-gray-500">
                        ชื่อ:
                      </span>
                      <span className="col-span-2 text-sm text-gray-900">
                        {tour.sub_agent_name}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <span className="text-sm font-medium text-gray-500">
                        ที่อยู่:
                      </span>
                      <span className="col-span-2 text-sm text-gray-900">
                        {tour.address || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    ช่องทางการติดต่อ
                  </h3>
                  <div className="space-y-3">
                    {tour.phone && (
                      <div className="grid grid-cols-3 gap-3">
                        <span className="text-sm font-medium text-gray-500">
                          เบอร์โทร:
                        </span>
                        <span className="col-span-2 text-sm text-blue-600">
                          <a
                            href={`tel:${tour.phone}`}
                            className="hover:underline"
                          >
                            {tour.phone}
                          </a>
                        </span>
                      </div>
                    )}
                    {tour.line && (
                      <div className="grid grid-cols-3 gap-3">
                        <span className="text-sm font-medium text-gray-500">
                          Line:
                        </span>
                        <span className="col-span-2 text-sm text-gray-900">
                          {tour.line}
                        </span>
                      </div>
                    )}
                    {tour.facebook && (
                      <div className="grid grid-cols-3 gap-3">
                        <span className="text-sm font-medium text-gray-500">
                          Facebook:
                        </span>
                        <span className="col-span-2 text-sm text-blue-600">
                          <a
                            href={tour.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {tour.facebook}
                          </a>
                        </span>
                      </div>
                    )}
                    {tour.whatsapp && (
                      <div className="grid grid-cols-3 gap-3">
                        <span className="text-sm font-medium text-gray-500">
                          WhatsApp:
                        </span>
                        <span className="col-span-2 text-sm text-green-600">
                          <a
                            href={`https://wa.me/${tour.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {tour.whatsapp}
                          </a>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* System Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    ข้อมูลระบบ
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <span className="text-sm font-medium text-gray-500">
                        อัพเดทเมื่อ:
                      </span>
                      <span className="col-span-2 text-sm text-gray-900">
                        {new Date(tour.updated_at).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <span className="text-sm font-medium text-gray-500">
                        อัพเดทโดย:
                      </span>
                      <span className="col-span-2 text-sm text-gray-900">
                        {tour.updated_by}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                หมายเหตุ
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {getNotesWithExpiry(tour)}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer sticky bottom-0 border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
            >
              ปิด
            </button>
            <Link
              to={`/edit/${tour.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              onClick={onClose}
            >
              แก้ไขข้อมูล
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailsModal;
