import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import moment from 'moment';

import Decade from './decade.jsx';

class DatePicker extends React.Component{
  constructor(props){
    super(props);
    this.getDecades = this.getDecades.bind(this);
    this.showYears = this.showYears.bind(this);

    this.state = {
      decades: this.getDecades(),
      decade: null,
      tab: null
    };
  }

  getDecades() {
    let firstYear = Object.keys(this.props.charts)[Object.keys(this.props.charts).length - 1].slice(0, 4);
    let lastYear = Object.keys(this.props.charts)[0].slice(0, 4);

    let years = _.range(Number(firstYear), Number(lastYear) + 1);

    let decades = {};
    _.each(years, year => {
      let decade = year.toString().slice(0, 3) + "0's";
      if (!decades[decade]) {
        decades[decade] = [year];
      } else {
        decades[decade].push(year);
      }
    });

    return decades;
  }

  showYears(decade) {
    this.setState({ decade: decade });
  }

  render() {
    let decadeComponents = _.map(_.keys(this.state.decades).sort(), decade => {
      return <Decade currentDate={this.props.currentDate} key={decade} decade={decade} years={this.state.decades[decade]} dates={_.keys(this.props.charts)} setChartDate={this.props.setChartDate}/>;
    });

    return (
      <div id='datePicker'>
          {decadeComponents}
      </div>
    );
  }
}

export default DatePicker;
