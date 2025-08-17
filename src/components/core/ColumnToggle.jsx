import { useState } from "react";

const ColumnToggle = ({ columns, visibleColumns, onToggleColumn }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (columnKey) => {
    onToggleColumn(columnKey);
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
      >
        <span>⚙️</span>
        <span>แสดง/ซ่อนคอลัมน์</span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="dropdown-backdrop fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="column-toggle-dropdown absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">
                เลือกคอลัมน์ที่ต้องการแสดง:
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {columns.map((column) => (
                  <label
                    key={column.key}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns[column.key]}
                      onChange={() => handleToggle(column.key)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 flex-1">
                      {column.label}
                    </span>
                    {visibleColumns[column.key] && (
                      <span className="text-green-500 text-xs">✓</span>
                    )}
                  </label>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="flex justify-between pt-3 mt-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    columns.forEach((col) => {
                      if (!visibleColumns[col.key]) {
                        handleToggle(col.key);
                      }
                    });
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  เลือกทั้งหมด
                </button>
                <button
                  onClick={() => {
                    columns.forEach((col) => {
                      if (
                        visibleColumns[col.key] &&
                        col.key !== "id" &&
                        col.key !== "tour_name"
                      ) {
                        handleToggle(col.key);
                      }
                    });
                  }}
                  className="text-xs text-gray-600 hover:text-gray-800"
                >
                  รีเซ็ต
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ColumnToggle;
