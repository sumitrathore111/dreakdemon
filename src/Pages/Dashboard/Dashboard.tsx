import { motion } from "framer-motion";

export default function DashboardComingSoon() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-10 text-center"
      >
        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-200 to-teal-200 flex items-center justify-center">
          <span className="text-3xl font-bold text-white/80">📊</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="mt-3 text-gray-500 text-sm max-w-md mx-auto">
          Our dashboard is being prepared to give you powerful insights and
          personalized metrics. Hang tight — it’s coming soon!
        </p>

        {/* Coming Soon Badge */}
        <div className="mt-6 inline-block px-5 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white text-sm font-medium rounded-full shadow-md">
          🚀 Coming Soon
        </div>

        {/* Features Preview */}
        <div className="mt-8 bg-gray-50 rounded-lg p-5 text-left text-gray-600 text-sm">
          <h3 className="font-semibold text-gray-700 mb-2">What’s coming:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Real-time analytics and charts</li>
            <li>Quick overview of your activity</li>
            <li>Notifications and reminders</li>
            <li>Customizable widgets for your needs</li>
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
