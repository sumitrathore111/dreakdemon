import React, { useEffect, useState } from "react";

const ConsentBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookie_consent", "rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="flex-1 text-gray-700 dark:text-gray-200 text-sm">
          We use cookies to improve your experience. See our{" "}
          <a href="/privacy-policy" className="text-[#00ADB5] underline">
            Privacy Policy
          </a>.
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            className="bg-[#00ADB5] hover:bg-cyan-600 text-white font-semibold px-5 py-1.5 rounded transition-all"
          >
            Accept
          </button>
          <button
            onClick={handleReject}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold px-5 py-1.5 rounded transition-all"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
