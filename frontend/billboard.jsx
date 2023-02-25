import React from "react";
import ReactDOM from "react-dom";
import { Link, IndexRoute, Route, Router, hashHistory } from 'react-router';
import Home from "./components/home";

class Billboard extends React.Component {
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

const routes = (
  <Route path="/" component={Billboard}>
    <IndexRoute component={Home} />
  </Route>
);

document.addEventListener("DOMContentLoaded", function(){
  ReactDOM.render(
    <Router history={hashHistory}>
      {routes}
    </Router>, document.getElementById('root'));
});
