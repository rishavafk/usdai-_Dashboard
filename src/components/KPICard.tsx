import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  delay?: number;
}

export const KPICard = ({ title, value, icon: Icon, color, delay = 0 }: KPICardProps) => {
  const colorMap: { [key: string]: { bg: string; border: string; text: string } } = {
    'border-emerald-600': { bg: 'bg-emerald-50', border: 'border-emerald-600', text: 'text-emerald-700' },
    'border-yellow-500': { bg: 'bg-yellow-50', border: 'border-yellow-500', text: 'text-yellow-700' },
    'border-pink-500': { bg: 'bg-pink-50', border: 'border-pink-500', text: 'text-pink-700' },
  };

  const colorConfig = colorMap[color] || colorMap['border-emerald-600'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`bg-white rounded-2xl shadow-md p-6 border-l-4 ${colorConfig.border} hover:shadow-lg transition-shadow`}
    >
      <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">{title}</p>
      <p className="text-4xl font-black text-gray-900">{value}</p>
    </motion.div>
  );
};
