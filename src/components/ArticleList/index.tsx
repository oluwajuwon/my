import React from "react";
import { MediumStory } from "../../types/medium";
import "./style.css";

interface ArticleListProps {
  posts: MediumStory[];
  limit?: number;
}

const plainText = (html: string) => {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  return parsed.body.textContent?.trim() ?? "";
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date));

const ArticleList: React.FC<ArticleListProps> = ({ posts, limit }) => (
  <div className="article-list">
    {posts.slice(0, limit).map((post) => (
      <article className="article-row" key={post.guid}>
        <div className="article-meta">
          <time dateTime={post.pubDate}>{formatDate(post.pubDate)}</time>
          {post.categories?.[0] && <span>{post.categories[0]}</span>}
        </div>
        <div>
          <h3><a href={post.link} target="_blank" rel="noreferrer">{post.title}</a></h3>
          <p>{plainText(post.description).slice(0, 190)}{plainText(post.description).length > 190 ? "…" : ""}</p>
          <a className="text-link" href={post.link} target="_blank" rel="noreferrer" aria-label={`Read ${post.title} on Medium`}>
            Read article <span aria-hidden="true">↗</span>
          </a>
        </div>
      </article>
    ))}
  </div>
);

export default ArticleList;
