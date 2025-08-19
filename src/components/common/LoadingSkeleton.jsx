// Loading Skeleton Components for better UX

export const TableSkeleton = ({ rows = 5, columns = 7 }) => (
  <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-6 py-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {Array.from({ length: columns }).map((_, j) => (
                <td key={j} className="px-6 py-4">
                  <div
                    className={`h-4 bg-gray-200 rounded animate-pulse ${
                      j === 0
                        ? "w-8"
                        : j === 1
                        ? "w-32"
                        : j === columns - 1
                        ? "w-20"
                        : "w-16"
                    }`}
                  ></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const CardSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="animate-pulse">
          <div className="flex items-center">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const ListSkeleton = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
      >
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-1 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>
        <div className="w-12 h-6 bg-gray-200 rounded animate-pulse"></div>
      </div>
    ))}
  </div>
);

export const DetailSkeleton = () => (
  <div className="max-w-7xl mx-auto space-y-6">
    {/* Header Skeleton */}
    <div className="flex items-center space-x-4">
      <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
      <div className="flex-1">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      </div>
    </div>

    {/* Info Cards Skeleton */}
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>

    {/* Table Skeleton */}
    <TableSkeleton rows={3} columns={6} />
  </div>
);

export const ErrorState = ({
  title = "เกิดข้อผิดพลาด",
  message = "ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
  onRetry,
  icon = "😞",
}) => (
  <div className="text-center py-12">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-4 max-w-md mx-auto">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        🔄 ลองใหม่
      </button>
    )}
  </div>
);

export const EmptyState = ({
  title = "ไม่มีข้อมูล",
  message = "ยังไม่มีข้อมูลในระบบ",
  actionText,
  onAction,
  icon = "📭",
}) => (
  <div className="text-center py-12">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-4 max-w-md mx-auto">{message}</p>
    {actionText && onAction && (
      <button
        onClick={onAction}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        {actionText}
      </button>
    )}
  </div>
);

// Mobile responsive improvements
export const MobileOptimizedTable = ({
  data = [],
  columns = [],
  onRowClick,
  loading = false,
  selectedItems = [],
  onSelectItem,
  onSelectAll,
}) => {
  if (loading) {
    return <TableSkeleton />;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {onSelectAll && (
                <th className="px-6 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedItems.length === data.length && data.length > 0
                    }
                    onChange={onSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onRowClick?.(item)}
              >
                {onSelectItem && (
                  <td className="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        onSelectItem(item.id);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-6 py-4 text-sm text-gray-900"
                  >
                    {column.render
                      ? column.render(item, index)
                      : item[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {data.map((item) => (
          <div
            key={item.id}
            className="p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer"
            onClick={() => onRowClick?.(item)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.name}</h3>
                <div className="mt-2 space-y-1">
                  {item.phone && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <span className="mr-1">📞</span> {item.phone}
                    </p>
                  )}
                  {item.tour_count !== undefined && (
                    <p className="text-sm text-gray-600">
                      🏝️ {item.tour_count} ทัวร์
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                {onSelectItem && (
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      onSelectItem(item.id);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                )}
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <EmptyState
          title="ไม่พบข้อมูล"
          message="ลองเปลี่ยนคำค้นหาหรือรีเฟรชหน้า"
          icon="🔍"
        />
      )}
    </div>
  );
};
