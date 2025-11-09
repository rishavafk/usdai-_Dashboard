import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-xl font-semibold text-gray-700">Loading Education Data...</p>
        <p className="text-sm text-gray-500 mt-2">Analyzing UDISE+ Dataset</p>
      </motion.div>
    </div>
  );
};
