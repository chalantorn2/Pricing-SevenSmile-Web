import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toursService } from "../../services/api-service";

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

  // === Helpers (ให้หน้าตา/ฟังก์ชันตรงกับ DetailsModal) ===
  const formatDate = (dateString) => {
    if (!dateString || dateString === "0000-00-00") return "ไม่กำหนด";
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price) => {
    const n =
      typeof price === "number"
        ? price
        : Number(String(price).replace(/[, ]/g, ""));
    if (Number.isNaN(n)) return "-";
    return new Intl.NumberFormat("th-TH").format(n);
  };

  const getNotesWithExpiry = (tour) => {
    let notes = tour.notes || "";
    notes =
      (tour.park_fee_included
        ? "ราคา Net นี้ รวมค่าอุทยานแล้ว"
        : "ราคา Net นี้ ยังไม่รวมค่าอุทยาน") + (notes ? ` | ${notes}` : "");
    if (tour.end_date && tour.end_date !== "0000-00-00") {
      const expired = new Date(tour.end_date) < new Date();
      if (expired) notes += " | ⚠️ หมดอายุแล้ว กรุณาต่ออายุ";
    }
    return notes;
  };

  const SectionHeader = ({ icon = "⬤", children }) => (
    <div className="flex items-center gap-2 rounded-t-xl bg-gray-50/80 px-4 py-3 border-b border-gray-200">
      <span className="text-xs">{icon}</span>
      <h3 className="text-sm font-semibold text-gray-900">{children}</h3>
    </div>
  );

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
                {!!tour.sub_agent_name && (
                  <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-gray-700 ring-1 ring-inset ring-gray-200">
                    Sub Agent: {tour.sub_agent_name}
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
          {/* Pricing */}
          <section className="mb-6 rounded-xl border border-gray-200 bg-gray-50/60 mx-6 mt-6">
            <SectionHeader icon="฿">ราคา Net (บาท)</SectionHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:gap-6">
              <div className="rounded-lg bg-white p-4 ring-1 ring-gray-200">
                <div className="text-xs text-gray-500">ผู้ใหญ่</div>
                <div className="mt-1 text-2xl font-bold text-emerald-600">
                  ฿{formatPrice(tour.adult_price)}
                </div>
              </div>
              <div className="rounded-lg bg-white p-4 ring-1 ring-gray-200">
                <div className="text-xs text-gray-500">เด็ก</div>
                <div className="mt-1 text-2xl font-bold text-emerald-600">
                  ฿{formatPrice(tour.child_price)}
                </div>
              </div>
            </div>
          </section>

          {/* Two columns info (same look as DetailsModal) */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 px-6 pb-6">
            {/* Left */}
            <section className="space-y-6">
              <div className="rounded-xl border border-gray-200">
                <SectionHeader icon="ℹ️">ข้อมูลทัวร์</SectionHeader>
                <dl className="divide-y divide-gray-100">
                  <div className="grid grid-cols-3 gap-3 px-4 py-3">
                    <dt className="text-xs font-medium text-gray-500">
                      ชื่อทัวร์
                    </dt>
                    <dd className="col-span-2 text-sm text-gray-900">
                      {tour.tour_name || "-"}
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-3 px-4 py-3">
                    <dt className="text-xs font-medium text-gray-500">
                      ออกจาก
                    </dt>
                    <dd className="col-span-2 text-sm text-gray-900">
                      {tour.departure_from || "-"}
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-3 px-4 py-3">
                    <dt className="text-xs font-medium text-gray-500">
                      ท่าเรือ
                    </dt>
                    <dd className="col-span-2 text-sm text-gray-900">
                      {tour.pier || "-"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-xl border border-gray-200">
                <SectionHeader icon="🗓️">
                  ช่วงเวลาที่ราคานี้ใช้ได้
                </SectionHeader>
                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                    <span className="text-xs font-medium text-gray-500">
                      วันที่เริ่มต้น
                    </span>
                    <span className="text-sm text-gray-900">
                      {formatDate(tour.start_date)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                    <span className="text-xs font-medium text-gray-500">
                      วันที่สิ้นสุด
                    </span>
                    <span className="text-sm text-gray-900">
                      {formatDate(tour.end_date)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Right */}
            <section className="space-y-6">
              <div className="rounded-xl border border-gray-200">
                <SectionHeader icon="☎️">ช่องทางการติดต่อ</SectionHeader>
                <dl className="divide-y divide-gray-100">
                  {tour.phone && (
                    <div className="grid grid-cols-3 gap-3 px-4 py-3">
                      <dt className="text-xs font-medium text-gray-500">
                        เบอร์โทร
                      </dt>
                      <dd className="col-span-2 text-sm">
                        <a
                          href={`tel:${tour.phone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {tour.phone}
                        </a>
                      </dd>
                    </div>
                  )}
                  {tour.line && (
                    <div className="grid grid-cols-3 gap-3 px-4 py-3">
                      <dt className="text-xs font-medium text-gray-500">
                        Line
                      </dt>
                      <dd className="col-span-2 text-sm text-gray-900">
                        {tour.line}
                      </dd>
                    </div>
                  )}
                  {tour.facebook && (
                    <div className="grid grid-cols-3 gap-3 px-4 py-3">
                      <dt className="text-xs font-medium text-gray-500">
                        Facebook
                      </dt>
                      <dd className="col-span-2 text-sm">
                        <a
                          href={tour.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all text-blue-600 hover:underline"
                        >
                          {tour.facebook}
                        </a>
                      </dd>
                    </div>
                  )}
                  {tour.whatsapp && (
                    <div className="grid grid-cols-3 gap-3 px-4 py-3">
                      <dt className="text-xs font-medium text-gray-500">
                        WhatsApp
                      </dt>
                      <dd className="col-span-2 text-sm">
                        <a
                          href={`https://wa.me/${tour.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:underline"
                        >
                          {tour.whatsapp}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="rounded-xl border border-gray-200">
                <SectionHeader icon="🤝">ข้อมูล Sub Agent</SectionHeader>
                <dl className="divide-y divide-gray-100">
                  <div className="grid grid-cols-3 gap-3 px-4 py-3">
                    <dt className="text-xs font-medium text-gray-500">ชื่อ</dt>
                    <dd className="col-span-2 text-sm text-gray-900">
                      {tour.sub_agent_name || "-"}
                    </dd>
                  </div>
                  {tour.address && (
                    <div className="grid grid-cols-3 gap-3 px-4 py-3">
                      <dt className="text-xs font-medium text-gray-500">
                        ที่อยู่
                      </dt>
                      <dd className="col-span-2 text-sm text-gray-900">
                        {tour.address}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="rounded-xl border border-gray-200">
                <SectionHeader icon="⚙️">ข้อมูลระบบ</SectionHeader>
                <dl className="divide-y divide-gray-100">
                  <div className="grid grid-cols-3 gap-3 px-4 py-3">
                    <dt className="text-xs font-medium text-gray-500">
                      อัพเดทเมื่อ
                    </dt>
                    <dd className="col-span-2 text-sm text-gray-900">
                      {tour.updated_at
                        ? new Date(tour.updated_at).toLocaleDateString(
                            "th-TH",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "-"}
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-3 px-4 py-3">
                    <dt className="text-xs font-medium text-gray-500">
                      อัพเดทโดย
                    </dt>
                    <dd className="col-span-2 text-sm text-gray-900">
                      {tour.updated_by || "-"}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>
          </div>

          {/* Notes */}
          <div className="px-6 pb-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">
              หมายเหตุ
            </h3>
            <div
              className={`rounded-xl p-4 ring-1 ${
                tour.park_fee_included
                  ? "bg-emerald-50 ring-emerald-200"
                  : "bg-amber-50 ring-amber-200"
              }`}
            >
              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                {getNotesWithExpiry(tour)}
              </p>
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
