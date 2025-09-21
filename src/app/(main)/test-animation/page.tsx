'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function TestAnimationPage() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">页面切换动画测试</h1>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] }}
        className="bg-card p-6 rounded-lg shadow-md"
      >
        <h2 className="text-xl font-semibold mb-4">动画测试区域</h2>
        <p className="mb-4">这是一个测试页面，用于验证页面切换动画是否正常工作。</p>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCount(c => c + 1)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            点击计数: {count}
          </button>
          
          <motion.div
            key={count}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="px-4 py-2 bg-secondary rounded-md"
          >
            计数: {count}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}