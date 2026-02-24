import dayjs from "dayjs";
import React from "react";
import { MediumStory } from "../../types/medium";
import { findText } from "../../utils";
import "./style.css";

interface StoryItemProps {
  story: MediumStory;
}

class StoryItem extends React.Component<StoryItemProps> {
  private itemRef: React.RefObject<HTMLDivElement | null>;

  constructor(props: StoryItemProps) {
    super(props);
    this.itemRef = React.createRef();
  }

  componentDidMount() {
    if (this.props.story && this.itemRef.current) {
      const textMatch = findText(this.props.story.description);
      if (textMatch && textMatch[0]) {
        this.itemRef.current.innerHTML = textMatch[0];
      }
    }
  }

  handleOpenLink = (): void => {
    if (this.props.story?.link) {
      window.open(this.props.story.link, "_blank");
    }
  };

  render() {
    const { story } = this.props;

    return (
      <div className="story-item">
        {story && (
          <p className="story-date">
            <span role="img" aria-label="calendar">
              📅
            </span>
            {dayjs(story.pubDate).format("ddd D MMM, YYYY")}
          </p>
        )}
        <h2 onClick={this.handleOpenLink}>{story?.title}</h2>
        <div ref={this.itemRef} className="story-description"></div>
        <div className="story-categories">
          {story.categories.map((tech: string, i: number) => (
            <div key={i} className="item">
              {tech}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default StoryItem;
