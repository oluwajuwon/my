import React, { useEffect, useState } from 'react';
import { getMediumPosts } from '../../api';
import Storyitem from '../../components/StoryItem';
import './style.css';

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true)
    getMediumPosts()
    .then(data => {
      setLoading(false)
      setStories(data.items);
    });
  }, [])

  return (
    <div className="stories-page">
      <div className="stories-section">
      <h1><span role="img" aria-label="story">📜 </span>My Stories</h1>
      {loading &&
        <h3>loading...</h3>
      }
      {stories?.map(story => {
        return (
          <Storyitem story={story} key={Math.random()} />
        )
      })}
      </div>
    </div>
  )
}

export default Stories;
