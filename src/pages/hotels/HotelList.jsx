import { useParams } from "react-router-dom";

const HotelList = () => {
  const { province } = useParams();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-gray-900">Hotels</h1>
            {province && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                📍 {province}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage hotel prices and information
          </p>
        </div>
      </div>

      {/* In development */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-12">
        <div className="text-center space-y-5">
          <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
            <span className="text-4xl">🏨</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {province ? `Hotels — ${province}` : "Hotel Management"}
            </h2>
            <p className="text-gray-500">This page is under development.</p>
          </div>
          <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
            <span className="text-xl">🚧</span>
            <span className="font-medium text-yellow-800">In development</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelList;
