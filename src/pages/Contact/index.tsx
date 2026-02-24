import { motion } from "framer-motion";
import React from "react";
import {
  FaArrowUpRightFromSquare,
  FaEnvelope,
  FaGithub,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa6";
import { useOutletContext } from "react-router-dom";

interface ContactLink {
  url: string;
  icon: React.ReactNode;
  label: string;
}

interface ThemeContext {
  isDark: boolean;
}

const Contact: React.FC = () => {
  const { isDark } = useOutletContext<ThemeContext>();

  const contactLinks: ContactLink[] = [
    {
      url: "https://www.linkedin.com/in/isaac-fagbohungbe-290a0b12b/",
      icon: <FaLinkedin size={20} />,
      label: "LinkedIn",
    },
    {
      url: "https://x.com/oluwajuwon__",
      icon: <FaTwitter size={20} />,
      label: "Twitter",
    },
    {
      url: "https://github.com/oluwajuwon",
      icon: <FaGithub size={20} />,
      label: "GitHub",
    },
    {
      url: "mailto:jfagbohungbe@gmail.com",
      icon: <FaEnvelope size={20} />,
      label: "E-mail",
    },
  ];

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-6 lg:px-20 ${isDark ? "bg-[#0a0a0a]" : "bg-gray-50"}`}
    >
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1
            className={`text-4xl lg:text-5xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Contact<span className="text-[#4ad8fc]">.</span>
          </h1>
          <p
            className={`text-base ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Contact me or follow my social media
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16"
        >
          {contactLinks.map((link, index) => (
            <motion.a
              key={index}
              href={link.url}
              target={link.url.startsWith("mailto") ? "_self" : "_blank"}
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              className={`group flex items-center justify-between px-5 py-4 rounded-xl border hover:border-[#4ad8fc]/50 transition-all duration-300 ${isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200 shadow-sm"}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-400 group-hover:text-[#4ad8fc] transition-colors duration-300">
                  {link.icon}
                </span>
                <span
                  className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}
                >
                  {link.label}
                </span>
              </div>
              <FaArrowUpRightFromSquare
                size={14}
                className="text-gray-500 group-hover:text-[#4ad8fc] transition-colors duration-300"
              />
            </motion.a>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center"
        >
          <p className="text-gray-500 text-sm">
            ©{new Date().getFullYear()} | Juwonlo
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
