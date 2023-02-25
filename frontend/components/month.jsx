import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import moment from 'moment';

class Month extends React.Component{
  constructor(props){
    super(props);
    this.playFromMonth = this.playFromMonth.bind(this);
    this.getMonthDates = this.getMonthDates.bind(this);
  }

  getMonthDates() {
    // formats as YYYY-MM to find dates that belong to this month in this year
    let yearMonthDate = `${this.props.year}-${moment().month(this.props.month).format('MM')}`;

    return _.filter(this.props.dates, date => {
      return date.slice(0, 7) === yearMonthDate;
    }).reverse();
  }

  playFromMonth() {
    let monthDates = this.getMonthDates();
    this.props.setChartDate(monthDates[monthDates.length - 1]); // play from last song in month
  }

  render() {
    let hvrPulse = this.props.isCurrentMonth ? 'hvr-pulse' : '';

    return (
        <div className={`${hvrPulse} month`} onClick={this.playFromMonth}>
          {this.props.month}
        </div>
    );
  }
}

export default Month;
