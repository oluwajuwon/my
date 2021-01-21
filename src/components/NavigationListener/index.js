import { Component } from "react";
import { withRouter } from "react-router-dom";

class NavigationListener extends Component {
  componentDidUpdate(prevProps) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      window.scrollTo(0, 0);
    }
  }
  render() {
    return null;
  }
}

export default withRouter((NavigationListener));