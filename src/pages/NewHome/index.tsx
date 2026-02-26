import { motion } from "framer-motion";
import React, { useCallback } from "react";
import { FaArrowDown } from "react-icons/fa6";
import { Link, useOutletContext } from "react-router-dom";

interface ThemeContext {
  isDark: boolean;
}

const skills = [
  "React Native",
  "TypeScript",
  "JavaScript",
  "React",
  "Node.js",
  "Express.js",
  "GraphQL",
  "REST APIs",
  "Git",
  "GitHub",
  "CI/CD",
  "HTML5",
  "CSS3",
  "Tailwind CSS",
  "Redux",
  "Redux Toolkit",
  "React Query",
  "Next.js",
  "Gatsby",
  "Expo",
  "Firebase",
  "Supabase",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Prisma",
  "Docker",
  "AWS",
  "Vercel",
  "Netlify",
  "Heroku",
  "Jest",
  "React Testing Library",
  "Playwright",
  "Cypress",
  "Webpack",
  "Vite",
  "ESLint",
  "Prettier",
  "Figma",
  "Framer Motion",
  "GSAP",
  "WebSockets",
  "OAuth",
  "Sentry",
  "Analytics",
  "SEO",
  "Accessibility",
  "Performance Optimization",
  "Responsive Design",
  "Mobile-First Design",
  "Agile/Scrum",
  "Jira",
  "Notion",
  "Slack",
];

const NewHome: React.FC = () => {
  const { isDark } = useOutletContext<ThemeContext>();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const particlesRef = React.useRef<
    Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
    }>
  >([]);

  const scrollToAbout = useCallback(() => {
    const aboutSection = document.getElementById("about-section");
    aboutSection?.scrollIntoView({ behavior: "smooth" });
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const colors = [
      "#4ad8fc",
      "#60a5fa",
      "#a78bfa",
      "#f472b6",
      "#fbbf24",
      "#34d399",
    ];

    // Initialize particles
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 30; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = particle.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw connections to nearby particles
        particlesRef.current.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `${particle.color}${Math.floor(
              (1 - distance / 150) * 80,
            )
              .toString(16)
              .padStart(2, "0")}`;
            ctx.lineWidth = 1.5;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [isDark]);

  return (
    <div className={`min-h-screen ${isDark ? "bg-[#0a0a0a]" : "bg-gray-50"}`}>
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 lg:px-20 pt-20 relative overflow-hidden">
        {/* Particle Network Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity: 0.8 }}
        />
        {/* Centered Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10"
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
            className={`text-lg lg:text-xl mb-10 max-w-xl mx-auto ${isDark ? "text-gray-400" : "text-gray-600"}`}
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

        {/* Floating Code Snippet 1 - Top Right */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, -13, 0] }}
          transition={{
            opacity: { duration: 1, delay: 1.3 },
            y: {
              duration: 6.8,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 0.3,
            },
          }}
          className="hidden xl:block absolute top-24 right-1/4 pointer-events-none select-none"
        >
          <pre
            className={`font-heading text-xs leading-relaxed p-5 rounded-lg backdrop-blur-xl shadow-2xl ${
              isDark
                ? "bg-white/[0.02] border border-white/[0.08]"
                : "bg-gray-900/[0.02] border border-gray-900/[0.08]"
            }`}
            style={{
              boxShadow: isDark
                ? "0 0 20px rgba(74, 216, 252, 0.1)"
                : "0 0 20px rgba(74, 216, 252, 0.05)",
            }}
          >
            <code className="block opacity-70">
              <span className={isDark ? "text-purple-400" : "text-purple-600"}>
                const
              </span>{" "}
              <span className={isDark ? "text-blue-300" : "text-blue-600"}>
                skills
              </span>{" "}
              <span className={isDark ? "text-white" : "text-gray-800"}>=</span>{" "}
              <span className={isDark ? "text-yellow-300" : "text-yellow-600"}>
                {"["}
              </span>
              {"\n  "}
              <span className={isDark ? "text-green-400" : "text-green-600"}>
                "React Native"
              </span>
              <span className={isDark ? "text-white" : "text-gray-800"}>,</span>
              {"\n  "}
              <span className={isDark ? "text-green-400" : "text-green-600"}>
                "TypeScript"
              </span>
              <span className={isDark ? "text-white" : "text-gray-800"}>,</span>
              {"\n  "}
              <span className={isDark ? "text-green-400" : "text-green-600"}>
                "Node.js"
              </span>
              {"\n"}
              <span className={isDark ? "text-yellow-300" : "text-yellow-600"}>
                {"]"}
              </span>
              <span className={isDark ? "text-white" : "text-gray-800"}>;</span>
            </code>
          </pre>
        </motion.div>

        {/* Floating Code Snippet 2 - Top Left */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, -10, 0] }}
          transition={{
            opacity: { duration: 1, delay: 0.7 },
            y: { duration: 7, ease: "easeInOut", repeat: Infinity, delay: 1 },
          }}
          className="hidden lg:block absolute top-32 left-10 xl:left-20 pointer-events-none select-none"
        >
          <pre
            className={`font-heading text-xs leading-relaxed p-5 rounded-lg backdrop-blur-xl shadow-2xl ${
              isDark
                ? "bg-white/[0.02] border border-white/[0.08]"
                : "bg-gray-900/[0.02] border border-gray-900/[0.08]"
            }`}
            style={{
              boxShadow: isDark
                ? "0 0 20px rgba(74, 216, 252, 0.1)"
                : "0 0 20px rgba(74, 216, 252, 0.05)",
            }}
          >
            <code className="block opacity-70">
              <span className={isDark ? "text-purple-400" : "text-purple-600"}>
                function
              </span>{" "}
              <span className={isDark ? "text-blue-300" : "text-blue-600"}>
                buildApp
              </span>
              <span className={isDark ? "text-yellow-300" : "text-yellow-600"}>
                {"()"}
              </span>{" "}
              <span className={isDark ? "text-yellow-300" : "text-yellow-600"}>
                {"{"}
              </span>
              {"\n  "}
              <span className={isDark ? "text-purple-400" : "text-purple-600"}>
                return
              </span>{" "}
              <span className={isDark ? "text-green-400" : "text-green-600"}>
                "magic"
              </span>
              <span className={isDark ? "text-white" : "text-gray-800"}>;</span>
              {"\n"}
              <span className={isDark ? "text-yellow-300" : "text-yellow-600"}>
                {"}"}
              </span>
            </code>
          </pre>
        </motion.div>

        {/* Floating Code Snippet 3 - Bottom Right */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, -15, 0] }}
          transition={{
            opacity: { duration: 1, delay: 0.9 },
            y: { duration: 8, ease: "easeInOut", repeat: Infinity, delay: 0.5 },
          }}
          className="hidden lg:block absolute bottom-32 right-16 xl:right-32 pointer-events-none select-none"
        >
          <pre
            className={`font-heading text-xs leading-relaxed p-5 rounded-lg backdrop-blur-xl shadow-2xl ${
              isDark
                ? "bg-white/[0.02] border border-white/[0.08]"
                : "bg-gray-900/[0.02] border border-gray-900/[0.08]"
            }`}
            style={{
              boxShadow: isDark
                ? "0 0 20px rgba(74, 216, 252, 0.1)"
                : "0 0 20px rgba(74, 216, 252, 0.05)",
            }}
          >
            <code className="block opacity-70">
              <span className={isDark ? "text-cyan-300" : "text-cyan-600"}>
                focus
              </span>
              <span className={isDark ? "text-white" : "text-gray-800"}>:</span>{" "}
              <span className={isDark ? "text-green-400" : "text-green-600"}>
                "Mobile"
              </span>
              {"\n"}
              <span className={isDark ? "text-cyan-300" : "text-cyan-600"}>
                passion
              </span>
              <span className={isDark ? "text-white" : "text-gray-800"}>:</span>{" "}
              <span className={isDark ? "text-green-400" : "text-green-600"}>
                "Clean code"
              </span>
            </code>
          </pre>
        </motion.div>

        {/* Floating Code Snippet 5 - Middle Right */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, -11, 0] }}
          transition={{
            opacity: { duration: 1, delay: 0.6 },
            y: {
              duration: 6.5,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 0.8,
            },
          }}
          className="hidden lg:block absolute top-1/2 -translate-y-1/2 right-64 xl:right-64 pointer-events-none select-none"
        >
          <pre
            className={`font-heading text-xs leading-relaxed p-5 rounded-lg backdrop-blur-xl shadow-2xl ${
              isDark
                ? "bg-white/[0.02] border border-white/[0.08]"
                : "bg-gray-900/[0.02] border border-gray-900/[0.08]"
            }`}
            style={{
              boxShadow: isDark
                ? "0 0 20px rgba(74, 216, 252, 0.1)"
                : "0 0 20px rgba(74, 216, 252, 0.05)",
            }}
          >
            <code className="block opacity-70">
              <span className={isDark ? "text-purple-400" : "text-purple-600"}>
                if
              </span>{" "}
              <span className={isDark ? "text-yellow-300" : "text-yellow-600"}>
                {"("}
              </span>
              <span className={isDark ? "text-blue-300" : "text-blue-600"}>
                mobile
              </span>
              <span className={isDark ? "text-yellow-300" : "text-yellow-600"}>
                {")"}
              </span>{" "}
              <span className={isDark ? "text-yellow-300" : "text-yellow-600"}>
                {"{"}
              </span>
              {"\n  "}
              <span className={isDark ? "text-blue-300" : "text-blue-600"}>
                ship
              </span>
              <span className={isDark ? "text-yellow-300" : "text-yellow-600"}>
                {"()"}
              </span>
              <span className={isDark ? "text-white" : "text-gray-800"}>;</span>
              {"\n"}
              <span className={isDark ? "text-yellow-300" : "text-yellow-600"}>
                {"}"}
              </span>
            </code>
          </pre>
        </motion.div>

        {/* Floating Code Snippet 6 - Middle Left */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, -9, 0] }}
          transition={{
            opacity: { duration: 1, delay: 0.8 },
            y: { duration: 7.5, ease: "easeInOut", repeat: Infinity, delay: 2 },
          }}
          className="hidden lg:block absolute top-1/2 -translate-y-1/2 left-4 xl:left-8 pointer-events-none select-none"
        >
          <pre
            className={`font-heading text-xs leading-relaxed p-5 rounded-lg backdrop-blur-xl shadow-2xl ${
              isDark
                ? "bg-white/[0.02] border border-white/[0.08]"
                : "bg-gray-900/[0.02] border border-gray-900/[0.08]"
            }`}
            style={{
              boxShadow: isDark
                ? "0 0 20px rgba(74, 216, 252, 0.1)"
                : "0 0 20px rgba(74, 216, 252, 0.05)",
            }}
          >
            <code className="block opacity-70">
              <span className={isDark ? "text-cyan-300" : "text-cyan-600"}>
                platform
              </span>
              <span className={isDark ? "text-white" : "text-gray-800"}>:</span>{" "}
              <span className={isDark ? "text-green-400" : "text-green-600"}>
                "iOS"
              </span>
              {"\n"}
              <span className={isDark ? "text-cyan-300" : "text-cyan-600"}>
                android
              </span>
              <span className={isDark ? "text-white" : "text-gray-800"}>:</span>{" "}
              <span className={isDark ? "text-orange-400" : "text-orange-600"}>
                true
              </span>
            </code>
          </pre>
        </motion.div>

        {/* Floating Code Snippet 8 - Bottom Center Left */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, -10, 0] }}
          transition={{
            opacity: { duration: 1, delay: 1.5 },
            y: {
              duration: 7.2,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 1.2,
            },
          }}
          className="hidden xl:block absolute bottom-36 left-1/4 pointer-events-none select-none"
        >
          <pre
            className={`font-heading text-xs leading-relaxed p-5 rounded-lg backdrop-blur-xl shadow-2xl ${
              isDark
                ? "bg-white/[0.02] border border-white/[0.08]"
                : "bg-gray-900/[0.02] border border-gray-900/[0.08]"
            }`}
            style={{
              boxShadow: isDark
                ? "0 0 20px rgba(74, 216, 252, 0.1)"
                : "0 0 20px rgba(74, 216, 252, 0.05)",
            }}
          >
            <code className="block opacity-70">
              <span className={isDark ? "text-purple-400" : "text-purple-600"}>
                const
              </span>{" "}
              <span className={isDark ? "text-blue-300" : "text-blue-600"}>
                tools
              </span>{" "}
              <span className={isDark ? "text-white" : "text-gray-800"}>=</span>{" "}
              <span className={isDark ? "text-yellow-300" : "text-yellow-600"}>
                {"["}
              </span>
              {"\n  "}
              <span className={isDark ? "text-green-400" : "text-green-600"}>
                "Expo"
              </span>
              <span className={isDark ? "text-white" : "text-gray-800"}>,</span>{" "}
              <span className={isDark ? "text-green-400" : "text-green-600"}>
                "Sentry"
              </span>
              {"\n"}
              <span className={isDark ? "text-yellow-300" : "text-yellow-600"}>
                {"]"}
              </span>
            </code>
          </pre>
        </motion.div>

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
        className="min-h-screen px-6 lg:px-20 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:items-center"
      >
        {/* About Me */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h3
            className={`text-3xl lg:text-4xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            About Me
          </h3>
          <div className="w-20 h-1 bg-[#4ad8fc] mb-8"></div>
          <div
            className={`space-y-6 text-lg leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            <p>
              I'm a{" "}
              <span
                className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                mobile-focused Software Engineer
              </span>{" "}
              who believes great software should feel effortless — even if
              what's happening underneath is anything but.
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
              , building scalable applications where reliability, speed, and
              usability actually matter.
            </p>
            <p>
              I enjoy untangling complex problems, simplifying messy flows, and
              shipping features that don't just "work" — they feel intentional.
              I'm big on clean architecture, thoughtful abstractions, and
              performance that holds up in production (not just in demos).
            </p>
            <p>
              Curious by default, detail-oriented by habit, and always learning
              — I build software that's practical, scalable, and designed to
              last.
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
