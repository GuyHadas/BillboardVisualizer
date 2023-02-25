import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

class Line extends React.Component{

  constructor(props){
    super(props);
    this.SECTION_LENGTH = 175;
    this.state = {
      x1: this.calculateStartingX(this.props.weekPosition),
      x2: this.calculateStartingX(this.props.weekPosition) + this.SECTION_LENGTH,
    };

    this.calculateStartingX = this.calculateStartingX.bind(this);
  }

  calculateStartingX(weekPosition) {
    return 700 - (weekPosition * this.SECTION_LENGTH);
  }

  render() {
    let coords = {
      x1: this.state.x1 - this.props.offset,
      y1: this.props.y1,
      x2: this.state.x2 - this.props.offset,
      y2: this.props.y2
    };

    return (
      <line {...coords} stroke={this.props.color} strokeWidth={2}/>
    );
  }
}

export default Line;
