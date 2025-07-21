import { useState, useEffect } from "react";
import { testConnection } from "../services/api-service";

const ConnectionStatus = () => {
  const [status, setStatus] = useState("testing");
  const [apiUrl, setApiUrl] = useState("");

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
    setApiUrl(baseUrl);

    try {
      const isConnected = await testConnection();
      setStatus(isConnected ? "connected" : "failed");
    } catch (error) {
      setStatus("failed");
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case "testing":
        return {
          text: "กำลังทดสอบการเชื่อมต่อ...",
          color: "text-yellow-600",
          bg: "bg-yellow-50",
          icon: "🔄",
        };
      case "connected":
        return {
          text: "เชื่อมต่อ API สำเร็จ",
          color: "text-green-600",
          bg: "bg-green-50",
          icon: "✅",
        };
      case "failed":
        return {
          text: "ไม่สามารถเชื่อมต่อ API ได้",
          color: "text-red-600",
          bg: "bg-red-50",
          icon: "❌",
        };
      default:
        return {
          text: "สถานะไม่ทราบ",
          color: "text-gray-600",
          bg: "bg-gray-50",
          icon: "❓",
        };
    }
  };

  const statusInfo = getStatusDisplay();

  if (status === "connected") {
    return null; // ไม่แสดงอะไรถ้าเชื่อมต่อสำเร็จ
  }

  return (
    <div
      className={`p-4 rounded-lg border ${statusInfo.bg} ${statusInfo.color} mb-4`}
    >
      <div className="flex items-center space-x-2">
        <span className="text-lg">{statusInfo.icon}</span>
        <div className="flex-1">
          <p className="font-medium">{statusInfo.text}</p>
          <p className="text-sm opacity-75">API URL: {apiUrl}</p>
          {status === "failed" && (
            <div className="mt-2 text-sm">
              <p className="font-medium">แนวทางแก้ไข:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>ตรวจสอบว่า API Server ทำงานอยู่หรือไม่</li>
                <li>ตรวจสอบ URL ใน .env ว่าถูกต้องหรือไม่</li>
                <li>ตรวจสอบ Network/Internet connection</li>
                <li>เปิด Developer Tools (F12) เพื่อดู Error ละเอียด</li>
              </ul>
              <button
                onClick={checkConnection}
                className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
              >
                ลองใหม่
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;
