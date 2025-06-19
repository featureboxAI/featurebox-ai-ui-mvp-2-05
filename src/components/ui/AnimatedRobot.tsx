
import React from 'react';
import { motion } from 'framer-motion';

const AnimatedRobot = () => {
  return (
    <div className="flex justify-center">
      <motion.div
        className="relative"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg
          width="80"
          height="80"
          viewBox="0 0 100 100"
          className="drop-shadow-lg"
        >
          {/* Robot body */}
          <motion.rect
            x="25"
            y="40"
            width="50"
            height="45"
            rx="8"
            fill="url(#robotGradient)"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          />
          
          {/* Robot head */}
          <motion.rect
            x="30"
            y="15"
            width="40"
            height="35"
            rx="6"
            fill="url(#headGradient)"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          />
          
          {/* Eyes */}
          <motion.circle
            cx="40"
            cy="28"
            r="4"
            fill="#4ade80"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.circle
            cx="60"
            cy="28"
            r="4"
            fill="#4ade80"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.1
            }}
          />
          
          {/* Antenna */}
          <motion.line
            x1="50"
            y1="15"
            x2="50"
            y2="8"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <motion.circle
            cx="50"
            cy="6"
            r="3"
            fill="#fbbf24"
            animate={{
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Arms */}
          <motion.rect
            x="15"
            y="45"
            width="15"
            height="8"
            rx="4"
            fill="url(#armGradient)"
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ transformOrigin: "22px 49px" }}
          />
          <motion.rect
            x="70"
            y="45"
            width="15"
            height="8"
            rx="4"
            fill="url(#armGradient)"
            animate={{
              rotate: [0, -10, 10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ transformOrigin: "78px 49px" }}
          />
          
          {/* Mouth */}
          <motion.path
            d="M 42 38 Q 50 42 58 38"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            animate={{
              d: [
                "M 42 38 Q 50 42 58 38",
                "M 42 38 Q 50 45 58 38",
                "M 42 38 Q 50 42 58 38"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Gradients */}
          <defs>
            <linearGradient id="robotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.8)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.8)" />
            </linearGradient>
            <linearGradient id="headGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(168, 85, 247, 0.9)" />
              <stop offset="100%" stopColor="rgba(139, 92, 246, 0.9)" />
            </linearGradient>
            <linearGradient id="armGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.8)" />
              <stop offset="100%" stopColor="rgba(79, 70, 229, 0.8)" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
};

export default AnimatedRobot;
