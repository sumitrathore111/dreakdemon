import { motion } from "framer-motion";

export default function ResumeComingSoon() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-10 text-center"
      >
        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full  flex items-center justify-center"
        style={{backgroundColor:'#00ADB5'}}
        
        >
          <span className="text-3xl font-bold text-white/80">📄</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-800">Resume Section</h1>
        <p className="mt-3 text-gray-500 text-sm max-w-md mx-auto">
          We’re crafting a powerful resume section to help you showcase your
          skills and achievements. Stay tuned for updates — launching soon!
        </p>

        {/* Coming Soon Badge */}
        <div className="mt-6 inline-block px-5 py-2  text-white text-sm font-medium rounded-full shadow-md"
        style={{backgroundColor:'#00ADB5'}}
        >
          🚀 Coming Soon
        </div>

        {/* Features Preview */}
        <div className="mt-8 bg-gray-50 rounded-lg p-5 text-left text-gray-600 text-sm">
          <h3 className="font-semibold text-gray-700 mb-2">
            What’s coming:
          </h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Upload and auto-format your resume</li>
            <li>ATS-friendly templates</li>
            <li>Instant preview and download</li>
            <li>Smart suggestions for improvement</li>
          </ul>
        </div>

        {/* Footer Note */}
        <p className="mt-8 text-xs text-gray-400">
          Last updated: Oct 4, 2025
        </p>
      </motion.div>
    </div>
  );
}
