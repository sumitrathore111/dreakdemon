import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const Path2Code = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-white dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 text-gray-900 dark:text-white text-center">
      <motion.div
        className="p-8 bg-gray-100 dark:bg-gray-800 dark:bg-opacity-50 rounded-lg shadow-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <BookOpen size={48} className="mx-auto mb-4" style={{ color: '#00ADB5' }} />
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#00ADB5' }}>Coming Soon</h1>
        <p className="text-lg mb-6">Your journey to coding mastery begins here. Stay tuned!</p>
        <div className="flex justify-center space-x-2">
          <div className="w-4 h-4 rounded-full animate-bounce" style={{ backgroundColor: '#00ADB5' }}></div>
          <div className="w-4 h-4 rounded-full animate-bounce delay-150" style={{ backgroundColor: '#00ADB5' }}></div>
          <div className="w-4 h-4 rounded-full animate-bounce delay-300" style={{ backgroundColor: '#00ADB5' }}></div>
        </div>
      </motion.div>
    </div>
  );
};

export default Path2Code;
