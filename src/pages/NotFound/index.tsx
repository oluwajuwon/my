import { motion } from "framer-motion";
import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <h1 className="text-8xl lg:text-9xl font-bold text-[#4ad8fc] mb-4">
          404
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Oops! The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-[#4ad8fc] text-black font-medium rounded-lg hover:bg-[#38bdf8] transition-all duration-300"
        >
          Go back home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
