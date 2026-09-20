import { useEffect, useState } from "react";
import { getMediumPosts } from "../api";
import { MediumStory } from "../types/medium";

let cachedPosts: MediumStory[] | null = null;
let pendingRequest: Promise<MediumStory[]> | null = null;

const loadPosts = () => {
  if (cachedPosts) return Promise.resolve(cachedPosts);
  if (!pendingRequest) {
    pendingRequest = getMediumPosts()
      .then((response) => {
        cachedPosts = response.items ?? [];
        return cachedPosts;
      })
      .finally(() => {
        pendingRequest = null;
      });
  }
  return pendingRequest;
};

export const useMediumPosts = () => {
  const [posts, setPosts] = useState<MediumStory[]>(cachedPosts ?? []);
  const [loading, setLoading] = useState(cachedPosts === null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    loadPosts()
      .then((items) => {
        if (active) setPosts(items);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { posts, loading, error };
};
