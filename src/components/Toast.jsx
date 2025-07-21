const Toast = ({ message, type = "success" }) => {
  const getToastStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-600 text-white";
      case "error":
        return "bg-red-600 text-white";
      case "warning":
        return "bg-yellow-600 text-white";
      default:
        return "bg-blue-600 text-white";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div
        className={`px-4 py-3 rounded-lg shadow-lg ${getToastStyles()} flex items-center space-x-2 min-w-64`}
      >
        <span>{message}</span>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Toast;
