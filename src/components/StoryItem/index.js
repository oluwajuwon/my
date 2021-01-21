import React from 'react';
import { findText } from '../../utils';
import './style.css';

class Storyitem extends React.Component {
  itemRef = React.createRef();

  componentDidMount() {
    if(this.props.story) {
      this.itemRef.current.innerHTML = `${findText(this.props.story.description)[0]}`
    }
  }

  handleOpenLink = () => {
    window.open(this.props.story?.link, '_blank');
  }

  render() {
    const { story } = this.props;

    return(
      <div className="story-item">
        <p className="story-date"><span role="img" aria-label="calendar">&#128197;</span> {story && new Date(story?.pubDate).toDateString()}</p>
        <h2 onClick={this.handleOpenLink}>{story?.title}</h2>
        <div ref={this.itemRef} className="story-description"></div>
        <div className='story-categories'>
          {story.categories.map((tech, i) => (
            <div key={i}  className='item'>{tech}</div>
          ))}
        </div>
      </div>
    )
  }
}

export default Storyitem;
