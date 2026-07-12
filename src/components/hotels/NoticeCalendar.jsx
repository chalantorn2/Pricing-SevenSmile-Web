import { useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Month calendar that visualises hotel Stop Sale / Promotion notices.
// Red dot = stop sale, green dot = promotion. Reused by HotelDetail (read-only)
// and HotelNoticeEditor (onDayClick sets the form start date).

const ymd = (d) => {
  // local-date YYYY-MM-DD (avoid the UTC shift toISOString would introduce)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function NoticeCalendar({ notices = [], onDayClick }) {
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });

  const monthIdx = cursor.getMonth();

  const weeks = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = first.getDay(); // 0 = Sunday
    const gridStart = new Date(year, month, 1 - startOffset);
    const cells = [];
    for (let i = 0; i < 42; i++) {
      cells.push(
        new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i)
      );
    }
    const rows = [];
    for (let i = 0; i < 42; i += 7) rows.push(cells.slice(i, i + 7));
    return rows.filter((row) => row.some((d) => d.getMonth() === month));
  }, [cursor]);

  const noticesOn = useCallback(
    (dateStr) =>
      notices.filter(
        (n) => n.is_active !== 0 && n.date_start <= dateStr && dateStr <= n.date_end
      ),
    [notices]
  );

  const todayStr = ymd(new Date());

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), monthIdx - 1, 1))}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            title="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <h3 className="text-base font-semibold text-gray-900 w-44 text-center">
            {MONTHS[monthIdx]} {cursor.getFullYear()}
          </h3>
          <button
            onClick={() => setCursor(new Date(cursor.getFullYear(), monthIdx + 1, 1))}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            title="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-red-400" /> Stop Sale
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-400" /> Promotion
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DOW.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
            {d}
          </div>
        ))}
        {weeks.flat().map((d) => {
          const ds = ymd(d);
          const inMonth = d.getMonth() === monthIdx;
          const dayNotices = noticesOn(ds);
          const hasStop = dayNotices.some((n) => n.type === "stop_sale");
          const hasPromo = dayNotices.some((n) => n.type === "promotion");
          const isToday = ds === todayStr;
          const title =
            dayNotices
              .map(
                (n) =>
                  `${n.type === "stop_sale" ? "Stop Sale" : "Promo"}${
                    n.room_type ? " · " + n.room_type : ""
                  }${n.title ? " · " + n.title : ""}`
              )
              .join("\n") || (onDayClick ? "Set as start date" : "");
          // Full background fill by notice type (easier to read than dots).
          let bgClass = inMonth ? "bg-white" : "bg-gray-50/60";
          let textClass = inMonth ? "text-gray-700" : "text-gray-300";
          if (hasStop && hasPromo) {
            bgClass = "bg-gradient-to-br from-red-100 to-emerald-100";
            textClass = "text-gray-800";
          } else if (hasStop) {
            bgClass = "bg-red-100";
            textClass = "text-red-700";
          } else if (hasPromo) {
            bgClass = "bg-emerald-100";
            textClass = "text-emerald-700";
          }
          return (
            <button
              key={ds}
              onClick={onDayClick ? () => onDayClick(ds) : undefined}
              title={title}
              className={`relative min-h-[52px] rounded-lg border p-1.5 text-left transition ${bgClass} ${
                isToday ? "border-blue-400 ring-1 ring-blue-300" : "border-gray-100"
              } ${
                onDayClick ? "hover:border-blue-300 cursor-pointer" : "cursor-default"
              }`}
            >
              <span
                className={`text-xs font-medium ${textClass} ${
                  isToday ? "font-bold text-blue-600" : ""
                }`}
              >
                {d.getDate()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
