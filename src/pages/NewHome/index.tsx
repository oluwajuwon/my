import { motion } from "framer-motion";
import React, { useCallback } from "react";
import { FaArrowDown } from "react-icons/fa6";
import { Link, useOutletContext } from "react-router-dom";

interface ThemeContext {
  isDark: boolean;
}

const skills = [
  "HTML",
  "CSS",
  "JavaScript",
  "React",
  "Firebase",
  "RESTful API",
  "Redux / Redux Toolkit",
  "TypeScript",
  "React Native",
  "Node.js",
  "Azure DevOps",
  "Linear",
  "iOS",
  "Android",
  "Expo",
  "Sentry",
];

const NewHome: React.FC = () => {
  const { isDark } = useOutletContext<ThemeContext>();

  const scrollToAbout = useCallback(() => {
    const aboutSection = document.getElementById("about-section");
    aboutSection?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#0a0a0a]" : "bg-gray-50"}`}>
      {/* Hero Section */}
      <section className="min-h-screen flex items-center px-6 lg:px-20 pt-20 relative overflow-hidden">
        <div className="flex items-center justify-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1
              className={`text-5xl lg:text-7xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
            >
              Juwonlo
            </h1>
            <h2 className="text-4xl lg:text-6xl font-bold text-[#4ad8fc] mb-8">
              Software Engineer
            </h2>
            <p
              className={`text-lg lg:text-xl mb-10 max-w-xl ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              Making complex systems feel simple — one mobile app at a time.
            </p>
            <Link
              to="/portfolio"
              className="inline-block px-6 py-3 border border-[#4ad8fc] text-[#4ad8fc] text-sm font-medium rounded-lg hover:bg-[#4ad8fc] hover:text-black transition-all duration-300"
            >
              View my projects
            </Link>
          </motion.div>

          {/* Floating Code Snippet */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, -15, 0] }}
            transition={{
              opacity: { duration: 1, delay: 0.5 },
              y: { duration: 7, ease: "easeInOut", repeat: Infinity },
            }}
            className="hidden md:flex md:flex-1 md:justify-center pointer-events-none select-none"
          >
            <pre
              className={`font-heading text-xs lg:text-sm leading-loose p-6 lg:p-8 rounded-xl backdrop-blur-sm min-w-[480px] lg:min-w-[600px] ${
                isDark
                  ? "bg-white/[0.03] border border-white/[0.08]"
                  : "bg-gray-900/[0.03] border border-gray-900/[0.08]"
              }`}
            >
              <code className="block opacity-60">
                <span
                  className={isDark ? "text-purple-400" : "text-purple-600"}
                >
                  const
                </span>{" "}
                <span className={isDark ? "text-blue-300" : "text-blue-600"}>
                  engineer
                </span>{" "}
                <span className={isDark ? "text-white" : "text-gray-800"}>
                  =
                </span>{" "}
                <span
                  className={isDark ? "text-yellow-300" : "text-yellow-600"}
                >
                  {"{"}
                </span>
                {"\n"}
                {"  "}
                <span className={isDark ? "text-cyan-300" : "text-cyan-600"}>
                  name
                </span>
                <span className={isDark ? "text-white" : "text-gray-800"}>
                  :
                </span>{" "}
                <span className={isDark ? "text-green-400" : "text-green-600"}>
                  "Juwonlo"
                </span>
                <span className={isDark ? "text-white" : "text-gray-800"}>
                  ,
                </span>
                {"\n"}
                {"  "}
                <span className={isDark ? "text-cyan-300" : "text-cyan-600"}>
                  role
                </span>
                <span className={isDark ? "text-white" : "text-gray-800"}>
                  :
                </span>{" "}
                <span className={isDark ? "text-green-400" : "text-green-600"}>
                  "Software Engineer"
                </span>
                <span className={isDark ? "text-white" : "text-gray-800"}>
                  ,
                </span>
                {"\n"}
                {"  "}
                <span className={isDark ? "text-cyan-300" : "text-cyan-600"}>
                  focus
                </span>
                <span className={isDark ? "text-white" : "text-gray-800"}>
                  :
                </span>{" "}
                <span className={isDark ? "text-green-400" : "text-green-600"}>
                  "Mobile"
                </span>
                <span className={isDark ? "text-white" : "text-gray-800"}>
                  ,
                </span>
                {"\n"}
                {"  "}
                <span className={isDark ? "text-cyan-300" : "text-cyan-600"}>
                  stack
                </span>
                <span className={isDark ? "text-white" : "text-gray-800"}>
                  :
                </span>{" "}
                <span
                  className={isDark ? "text-yellow-300" : "text-yellow-600"}
                >
                  {"["}
                </span>
                {"\n"}
                {"    "}
                <span className={isDark ? "text-green-400" : "text-green-600"}>
                  "React Native"
                </span>
                <span className={isDark ? "text-white" : "text-gray-800"}>
                  ,
                </span>
                {"\n"}
                {"    "}
                <span className={isDark ? "text-green-400" : "text-green-600"}>
                  "TypeScript"
                </span>
                <span className={isDark ? "text-white" : "text-gray-800"}>
                  ,
                </span>
                {"\n"}
                {"    "}
                <span className={isDark ? "text-green-400" : "text-green-600"}>
                  "Node.js"
                </span>
                {"\n"}
                {"  "}
                <span
                  className={isDark ? "text-yellow-300" : "text-yellow-600"}
                >
                  {"]"}
                </span>
                <span className={isDark ? "text-white" : "text-gray-800"}>
                  ,
                </span>
                {"\n"}
                {"  "}
                <span className={isDark ? "text-cyan-300" : "text-cyan-600"}>
                  passion
                </span>
                <span className={isDark ? "text-white" : "text-gray-800"}>
                  :
                </span>{" "}
                <span className={isDark ? "text-green-400" : "text-green-600"}>
                  "Clean code"
                </span>
                {"\n"}
                <span
                  className={isDark ? "text-yellow-300" : "text-yellow-600"}
                >
                  {"}"}
                </span>
                <span className={isDark ? "text-white" : "text-gray-800"}>
                  ;
                </span>
              </code>
            </pre>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer"
          onClick={scrollToAbout}
        >
          <span
            className={`text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            More about me
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <FaArrowDown
              className={isDark ? "text-gray-400" : "text-gray-600"}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* About & Skills Section */}
      <section
        id="about-section"
        className="min-h-screen px-6 lg:px-20 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16"
      >
        {/* About Me */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3
            className={`text-3xl lg:text-4xl font-bold mb-8 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            About me
          </h3>
          <div
            className={`space-y-6 leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            <p>
              I'm{" "}
              <span
                className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Juwonlo
              </span>
              , a passionate and dedicated{" "}
              <span
                className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                software engineer.
              </span>{" "}
            </p>
            <p>
              Welcome to my little portfolio where I talk about myself and some
              of the projects I've participated in or currently participating
              in, tools I've used and some other cool things. If you're
              wondering why this portfolio is so plain and too simple, well it's
              because I got bored on a faithful day and decided to do a little
              something to kill time. I'll be updating it as time goes on. I'm
              guessing you're not here to read my rants, so you can checkout the
              other pages via the links at the bottom of the page.
            </p>
            <p>
              I have{" "}
              <span
                className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                6+ years of experience
              </span>{" "}
              working with various programming languages and frameworks such as
              HTML, CSS, JavaScript, React, React Native and Node.js. I thrive
              on solving complex problems and continuously learning new
              technologies to stay at the forefront of this ever-evolving field.
            </p>
            <p>
              <span
                className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                My goal is
              </span>{" "}
              to create applications that not only look great but also provide
              an intuitive and seamless experience for users.
            </p>
          </div>
        </motion.div>

        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3
            className={`text-3xl lg:text-4xl font-bold mb-8 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Skills
          </h3>
          <div className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <span
                key={skill}
                className="px-4 py-2 border border-[#4ad8fc] text-[#4ad8fc] text-sm rounded-lg hover:bg-[#4ad8fc] hover:text-black transition-all duration-300 cursor-default"
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default NewHome;
