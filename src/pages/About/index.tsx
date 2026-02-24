import { motion } from "framer-motion";
import React from "react";
import { useOutletContext } from "react-router-dom";
import gatsby from "../../assets/gatsby.png";
import git from "../../assets/git.png";
import GitHub from "../../assets/gitHub.png";
import graphql from "../../assets/graphql.png";
import Heroku from "../../assets/heroku.png";
import javascript from "../../assets/javascript.png";
import Netlify from "../../assets/netlify.png";
import node from "../../assets/node.png";
import PT from "../../assets/p-t.png";
import react from "../../assets/react.png";
import redux from "../../assets/redux.png";
import typescript from "../../assets/typescript.png";

interface TechIcon {
  src: string;
  alt: string;
}

interface ThemeContext {
  isDark: boolean;
}

const About: React.FC = () => {
  const { isDark } = useOutletContext<ThemeContext>();

  const techIcons: TechIcon[] = [
    { src: javascript, alt: "JavaScript" },
    { src: typescript, alt: "TypeScript" },
    { src: react, alt: "React" },
    { src: node, alt: "Node.js" },
    { src: gatsby, alt: "Gatsby" },
    { src: redux, alt: "Redux" },
    { src: git, alt: "Git" },
    { src: graphql, alt: "GraphQL" },
    { src: PT, alt: "Pivotal Tracker" },
    { src: Heroku, alt: "Heroku" },
    { src: Netlify, alt: "Netlify" },
    { src: GitHub, alt: "GitHub" },
  ];

  return (
    <div
      className={`min-h-screen px-6 lg:px-20 py-24 ${isDark ? "bg-[#0a0a0a]" : "bg-gray-50"}`}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1
            className={`text-4xl lg:text-5xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            About Me
          </h1>
          <div className="w-20 h-1 bg-[#4ad8fc] mb-8"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`space-y-6 text-lg leading-relaxed mb-16 ${isDark ? "text-gray-400" : "text-gray-600"}`}
        >
          <p>
            I'm a{" "}
            <span
              className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              mobile-focused Software Engineer
            </span>{" "}
            who believes great software should feel effortless — even if what's
            happening underneath is anything but.
          </p>
          <p>
            I started in frontend, but these days I think in systems:
            architecture, performance, state management, CI/CD, developer
            experience, and how all of it translates into real user value. I
            work primarily with{" "}
            <span
              className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
            >
              React Native and TypeScript
            </span>
            , building scalable fintech-grade applications where reliability,
            speed, and usability actually matter.
          </p>
          <p>
            I enjoy untangling complex problems, simplifying messy flows, and
            shipping features that don't just "work" — they feel intentional.
            I'm big on clean architecture, thoughtful abstractions, and
            performance that holds up in production (not just in demos).
          </p>
          <p>
            Curious by default, detail-oriented by habit, and always learning —
            I build software that's practical, scalable, and designed to last.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2
            className={`text-2xl lg:text-3xl font-bold mb-8 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Tools & Technologies
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
            {techIcons.map((icon, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
                className="group flex flex-col items-center"
              >
                <div
                  className={`w-16 h-16 rounded-xl p-3 border group-hover:border-[#4ad8fc]/50 transition-all duration-300 ${
                    isDark
                      ? "bg-white/5 border-white/10 group-hover:bg-white/10"
                      : "bg-white border-gray-200 group-hover:bg-gray-50 shadow-sm"
                  }`}
                >
                  <img
                    src={icon.src}
                    alt={icon.alt}
                    className={`w-full h-full object-contain transition-all duration-300 ${
                      isDark ? "filter grayscale group-hover:grayscale-0" : ""
                    }`}
                  />
                </div>
                <span
                  className={`mt-2 text-xs group-hover:text-[#4ad8fc] transition-colors duration-300 ${
                    isDark ? "text-gray-500" : "text-gray-600"
                  }`}
                >
                  {icon.alt}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
