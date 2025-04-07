
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassMorphCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

const GlassMorphCard: React.FC<GlassMorphCardProps> = ({ 
  children, 
  className, 
  onClick, 
  hover = true 
}) => {
  return (
    <motion.div
      className={cn(
        "bg-white bg-opacity-80 backdrop-filter backdrop-blur-sm rounded-xl p-6 border border-gray-100",
        hover ? "shadow-sm" : "",
        onClick ? "cursor-pointer" : "",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={hover && onClick ? { scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default GlassMorphCard;
