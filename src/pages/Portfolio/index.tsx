import { motion } from "framer-motion";
import React from "react";
import { useOutletContext } from "react-router-dom";
import { projects } from "./projects";
import { Project } from "./types";

interface ThemeContext {
  isDark: boolean;
}

const Portfolio: React.FC = () => {
  const { isDark } = useOutletContext<ThemeContext>();

  return (
    <div
      className={`min-h-screen px-6 lg:px-20 py-24 ${isDark ? "bg-[#0a0a0a]" : "bg-gray-50"}`}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1
            className={`text-4xl lg:text-5xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            My Portfolio
          </h1>
          <div className="w-20 h-1 bg-[#4ad8fc] mb-4"></div>
          <p
            className={`text-lg mb-12 ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Below are some of the projects I've worked on recently and the
            technologies I used
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project: Project, index: number) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className={`group rounded-2xl overflow-hidden border hover:border-[#4ad8fc]/30 transition-all duration-300 ${isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200 shadow-sm"}`}
            >
              <div className="relative overflow-hidden">
                <img
                  src={project.image}
                  alt={project.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t to-transparent opacity-60 ${isDark ? "from-[#0a0a0a]" : "from-white"}`}
                ></div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h2
                    className={`text-xl font-bold group-hover:text-[#4ad8fc] transition-colors duration-300 ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    {project.name}
                  </h2>
                  <span className="text-xs px-3 py-1 bg-[#4ad8fc]/10 text-[#4ad8fc] rounded-full">
                    {project.role}
                  </span>
                </div>

                <p
                  className={`text-sm mb-4 line-clamp-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech: string, i: number) => (
                    <span
                      key={i}
                      className={`text-xs px-2 py-1 rounded-lg border ${isDark ? "bg-white/5 text-gray-400 border-white/10" : "bg-gray-100 text-gray-600 border-gray-200"}`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-[#4ad8fc] hover:underline"
                  >
                    View Project →
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
