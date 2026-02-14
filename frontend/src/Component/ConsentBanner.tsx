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
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div className="relative bg-gradient-to-br from-[#00ADB5]/90 via-blue-400/80 to-cyan-400/90 dark:from-[#00ADB5]/80 dark:via-blue-900/80 dark:to-cyan-900/90 border border-[#00ADB5]/30 dark:border-cyan-900/40 rounded-3xl shadow-2xl p-7 flex flex-col md:flex-row items-center gap-6 animate-fade-in overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/20 dark:bg-gray-800/20 rounded-full blur-2xl z-0" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-cyan-200/20 dark:bg-cyan-900/20 rounded-full blur-2xl z-0" />
        <div className="flex-1 text-white text-base font-medium relative z-10">
          <span className="inline-flex items-center gap-2 font-bold text-lg">
            <svg className="w-6 h-6 text-white/80 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 13h6m2 0a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2m12 0v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-4" /></svg>
            We value your privacy
          </span>
          <br />
          We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. By continuing, you agree to our <a href="/privacy-policy" className="text-white underline font-semibold hover:text-[#00ADB5] transition-colors">Privacy Policy</a>.
        </div>
        <div className="flex gap-3 relative z-10">
          <button
            onClick={handleAccept}
            className="bg-white/90 hover:bg-white text-[#00ADB5] font-bold px-7 py-2 rounded-lg shadow-lg transition-all duration-200 border border-[#00ADB5]/30 focus:outline-none focus:ring-2 focus:ring-[#00ADB5]"
          >
            Accept
          </button>
          <button
            onClick={handleReject}
            className="bg-red-500/90 hover:bg-red-600 text-white font-bold px-7 py-2 rounded-lg shadow-lg transition-all duration-200 border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
