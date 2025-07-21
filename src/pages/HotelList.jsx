const HotelList = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">รายการ Hotel</h1>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-white rounded-lg shadow-sm border p-12">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
            <span className="text-4xl">🏨</span>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              ระบบจัดการ Hotel
            </h2>
            <p className="text-lg text-gray-600">
              ระบบจัดการราคาและข้อมูลโรงแรม
            </p>
          </div>

          {/* Status */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl">🚧</span>
              <div>
                <p className="font-semibold text-yellow-800">กำลังพัฒนา</p>
                <p className="text-sm text-yellow-700">Coming Soon...</p>
              </div>
            </div>
          </div>

          {/* Features Preview */}
          <div className="max-w-2xl mx-auto">
            <p className="text-sm text-gray-500 mb-4">ฟีเจอร์ที่กำลังจะมา:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span>🏨</span>
                <span>จัดการโรงแรม</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🛏️</span>
                <span>ประเภทห้อง</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📅</span>
                <span>ราคาตามฤดูกาล</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>💎</span>
                <span>ราคา Net</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelList;
