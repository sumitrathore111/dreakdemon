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

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div className="relative bg-gradient-to-br from-[#00ADB5]/90 via-blue-400/80 to-cyan-400/90 dark:from-[#00ADB5]/80 dark:via-blue-900/80 dark:to-cyan-900/90 border border-[#00ADB5]/30 dark:border-cyan-900/40 rounded-2xl shadow-2xl p-6 flex flex-col md:flex-row items-center gap-4 animate-fade-in overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute -top-8 -left-8 w-32 h-32 bg-white/20 dark:bg-gray-800/20 rounded-full blur-2xl z-0" />
        <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-cyan-200/20 dark:bg-cyan-900/20 rounded-full blur-2xl z-0" />
        <div className="flex-1 text-white text-sm font-medium relative z-10">
          We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. By continuing, you agree to our <a href="/privacy-policy" className="text-white underline font-semibold hover:text-[#00ADB5] transition-colors">Privacy Policy</a>.
        </div>
        <button
          onClick={handleAccept}
          className="mt-2 md:mt-0 bg-white/90 hover:bg-white text-[#00ADB5] font-bold px-7 py-2 rounded-lg shadow-lg transition-all duration-200 border border-[#00ADB5]/30"
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default ConsentBanner;
