import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Toast } from "../core";

const TourDetailsModal = ({ isOpen, onClose, tour }) => {
  const [showToast, setShowToast] = useState(false);
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);

  // A11y & UX
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !tour) return null;

  // Helpers
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

  // ⬅︎ กลับไปแบบเดิม: เปิดหน้าแชร์ /share/tour/:id ในแท็บใหม่
  const handleShare = () => {
    const url = `${window.location.origin}/share/tour/${tour.id}`;
    window.open(url, "_blank", "noopener,noreferrer");
    // (ถ้าอยากแจ้งผู้ใช้เล็กน้อย)
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
  };

  const handleBackdropClick = (e) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target)) {
      onClose?.();
    }
  };

  const SectionHeader = ({ icon = "⬤", children }) => (
    <div className="flex items-center gap-2 rounded-t-xl bg-gray-50/80 px-4 py-3 border-b border-gray-200">
      <span className="text-xs">{icon}</span>
      <h3 className="text-sm font-semibold text-gray-900">{children}</h3>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onMouseDown={handleBackdropClick}
      aria-labelledby="tour-modal-title"
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={dialogRef}
        className="mx-4 w-full max-w-4xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-start gap-3 border-b border-gray-200 px-6 py-5">
          <div className="min-w-0 flex-1">
            <h2
              id="tour-modal-title"
              className="truncate text-xl font-semibold text-gray-900"
              title={tour.tour_name}
            >
              {tour.tour_name || "รายละเอียดทัวร์"}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              {!!tour.pier && (
                <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-700 ring-1 ring-inset ring-gray-200">
                  ท่าเรือ: {tour.pier}
                </span>
              )}
              {!!tour.departure_from && (
                <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs text-gray-700 ring-1 ring-inset ring-gray-200">
                  ออกจาก: {tour.departure_from}
                </span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[.98]"
              title="เปิดหน้าแชร์"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h6m0 0v6m0-6l-8 8M7 7v10a2 2 0 002 2h6"
                />
              </svg>
              แชร์
            </button>
            <button
              ref={closeBtnRef}
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="ปิด"
            >
              <svg
                className="h-5 w-5"
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
              <span className="sr-only">ปิด</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {/* Price */}
          <section className="mb-6 rounded-xl border border-gray-200 bg-gray-50/60">
            <SectionHeader icon="฿">ราคา Net (บาท)</SectionHeader>
            <div className="grid grid-cols-2 gap-4 p-4 md:gap-6">
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

          {/* Two columns info */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Left: Tour info + Dates */}
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

            {/* Right: Contact + Agent + System */}
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
                <SectionHeader icon="🤝">ข้อมูล Supplier</SectionHeader>
                <dl className="divide-y divide-gray-100">
                  <div className="grid grid-cols-3 gap-3 px-4 py-3">
                    <dt className="text-xs font-medium text-gray-500">ชื่อ</dt>
                    <dd className="col-span-2 text-sm text-gray-900">
                      {tour.supplier_name || "-"}
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
          <section className="mt-6">
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
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[.98]"
          >
            ปิด
          </button>
          <Link
            to={`/edit/${tour.id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 active:scale-[.98]"
            onClick={onClose}
          >
            <span>✏️</span> แก้ไขข้อมูล
          </Link>
        </div>
      </div>

      {showToast && <Toast message="เปิดหน้าแชร์แล้ว" />}
    </div>
  );
};

export default TourDetailsModal;
