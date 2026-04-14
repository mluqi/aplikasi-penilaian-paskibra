"use client";

import { motion } from "framer-motion";

export default function PageHeader({ breadcrumb, title, subtitle }) {
  return (
    <section className="relative pt-36 pb-16 lg:pt-44 lg:pb-24 text-center bg-white dark:bg-gray-950 overflow-hidden border-b border-gray-100 dark:border-gray-800">
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-10 w-96 h-96 bg-red-500/10 dark:bg-red-500/20 rounded-full blur-[100px]"></div>
        <div className="absolute top-10 right-0 w-96 h-96 bg-orange-500/10 dark:bg-orange-500/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
        {breadcrumb && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center px-4 py-1.5 mb-6 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 rounded-full shadow-sm border border-red-100 dark:border-red-500/20 ring-1 ring-red-600/5 backdrop-blur-md"
          >
            {breadcrumb}
          </motion.span>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight mb-6 max-w-4xl leading-tight"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          {subtitle}
        </motion.p>
      </div>
    </section>
  );
}
