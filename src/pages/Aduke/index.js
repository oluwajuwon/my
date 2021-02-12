import React from 'react';
import { withRouter, Route, Switch } from "react-router-dom";
import Omoge from './Omoge';
import Gallery from './Gallery';
import Music from './Music';
import "bootstrap/dist/css/bootstrap.min.css";
import './style.css'

class Aduke extends React.Component {

  render() {
    const { match: { path } } = this.props;

    return (
      <div className="aduke-page">
        <Switch>
          <Route exact path={`${path}/`}>
            <Omoge />
          </Route>
          <Route path={`${path}/gallery`}>
            <Gallery />
          </Route>
          <Route path={`${path}/music`}>
            <Music />
          </Route>
        </Switch>
      </div>
    )
  }
}

export default withRouter(Aduke);
