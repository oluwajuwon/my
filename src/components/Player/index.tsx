import React, { useState, useEffect } from "react";

interface AudioHookResult {
  playing: boolean;
  toggle: () => void;
}

const useAudio = (url: string): AudioHookResult => {
  const [audio] = useState<HTMLAudioElement>(new Audio(url));
  const [playing, setPlaying] = useState<boolean>(false);

  const toggle = (): void => setPlaying(!playing);

  useEffect(() => {
    if (playing) {
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        setPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [playing, audio]);

  useEffect(() => {
    const handleEnded = () => setPlaying(false);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [audio]);

  return {
    playing,
    toggle
  };
};

interface PlayerProps {
  url: string;
}

const Player: React.FC<PlayerProps> = ({ url }) => {
  const { playing, toggle } = useAudio(url);

  return (
    <div>
      <button onClick={toggle}>{playing ? "Pause" : "Play"}</button>
    </div>
  );
};

export default Player;
