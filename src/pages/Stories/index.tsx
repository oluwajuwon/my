import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { getMediumPosts } from "../../api";
import { MediumStory } from "../../types/medium";

interface ThemeContext {
  isDark: boolean;
}

const Stories: React.FC = () => {
  const { isDark } = useOutletContext<ThemeContext>();
  const [stories, setStories] = useState<MediumStory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    getMediumPosts()
      .then((data) => {
        setLoading(false);
        setStories(data.items);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching stories:", error);
      });
  }, []);

  const getDescription = (description: string): string => {
    const match = description.match(/<p>(.*?)<\/p>/);
    if (match && match[1]) {
      const div = document.createElement("div");
      div.innerHTML = match[1];
      return div.textContent || div.innerText || "";
    }
    return "";
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

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
            My Stories
          </h1>
          <div className="w-20 h-1 bg-[#4ad8fc] mb-8"></div>
          <p
            className={`text-lg mb-12 ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Articles and thoughts I've shared on Medium
          </p>
        </motion.div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#4ad8fc] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <div className="space-y-6">
          {stories?.map((story, index) => (
            <motion.article
              key={story.guid}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              onClick={() => window.open(story.link, "_blank")}
              className={`group rounded-2xl p-6 border hover:border-[#4ad8fc]/30 cursor-pointer transition-all duration-300 ${isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200 shadow-sm"}`}
            >
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                <span>📅</span>
                <span>{formatDate(story.pubDate)}</span>
              </div>

              <h2
                className={`text-xl font-bold group-hover:text-[#4ad8fc] transition-colors duration-300 mb-3 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {story.title}
              </h2>

              <p
                className={`text-sm line-clamp-3 mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                {getDescription(story.description)}
              </p>

              <div className="flex flex-wrap gap-2">
                {story.categories?.map((category: string, i: number) => (
                  <span
                    key={i}
                    className="text-xs px-3 py-1 bg-[#4ad8fc]/10 text-[#4ad8fc] rounded-full"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>

        {!loading && stories.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400">No stories found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stories;
