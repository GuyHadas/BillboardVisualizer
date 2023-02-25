import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

class Year extends React.Component{
  constructor(props){
    super(props);
    this.playFromYear = this.playFromYear.bind(this);
  }

  playFromYear() {
    if (!this.props.isCurrentYear) {
      this.props.setChartDate(this.props.yearDates[this.props.yearDates.length - 1]); // play from last song in year
    }

    this.props.showMonths(this.props.year);
  }

  render() {
    let hvrPulse = this.props.isCurrentYear ? 'hvr-pulse' : '';

    return (
        <div className={`${hvrPulse} decadeYear`} onClick={this.playFromYear}>
          {this.props.year}
        </div>
    );
  }
}

export default Year;
