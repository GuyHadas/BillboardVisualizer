import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';

class GraphDate extends React.Component{

  constructor(props){
    super(props);
    this.SECTION_LENGTH = 175;
    this.state = {
      x: this.calculateStartingX(this.props.weekPosition),
    };

    this.calculateStartingX = this.calculateStartingX.bind(this);
    this.formatDate = this.formatDate.bind(this);
  }

  calculateStartingX(weekPosition) {
    return 660 - (weekPosition * this.SECTION_LENGTH);
  }

  formatDate(date) {
    if (!date) {
      return;
    }
    return moment(date).format('MMM D, YYYY');
  }

  render() {
    const x = this.state.x - this.props.offset;
    const formattedDate = this.formatDate(this.props.date);

    return (
      <text x={x} y='25' stroke='white' fill='white' fontSize='12'>
        {formattedDate}
      </text>
    );
  }
}

export default GraphDate;
