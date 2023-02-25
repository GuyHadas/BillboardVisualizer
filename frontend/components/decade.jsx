import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import moment from 'moment';

import Year from './year.jsx';
import Month from './month.jsx';

class Decade extends React.Component{
  constructor(props){
    super(props);
    this.showYears = this.showYears.bind(this);
    this.hideYears = this.hideYears.bind(this);
    this.animateYears = this.animateYears.bind(this);
    this.getDatesForYear = this.getDatesForYear.bind(this);

    this.showMonths = this.showMonths.bind(this);
    this.hideMonths = this.hideMonths.bind(this);
    this.animateMonths = this.animateMonths.bind(this);
    this.getMonths = this.getMonths.bind(this);

    this.state = {
      showYears: false,
      showMonths: false,
      years: [],
      months: [],
      year: null
    };
  }

  showYears() {
    if (this.state.showYears === false) {
      this.hideMonths();
      this.setState({ showYears: true });
      this.animateYears(this.props.years.slice());
    }
  }

  showMonths(year) {
    if (this.state.showMonths === false) {
      this.hideYears();
      this.setState({ showMonths: true, year: year });
      this.animateMonths(this.getMonths(year).slice());
    }
  }

  getMonths(year) {
    let months = {};
    _.each(this.getDatesForYear(year), date => {
      months[moment(date).format('MMMM')] = true;
    });

    return _.keys(months);
  }

  animateMonths(_months) {
    if (_months.length > 0) {
      this.monthAnimations = setTimeout(() => {
        this.setState({ months: this.state.months.concat(_months.shift()) });
        this.animateMonths(_months);
      }, 40);
    }
  }

  hideMonths() {
    clearTimeout(this.monthAnimations);
    this.setState({ showMonths: false, months: [], year: null });
  }

  animateYears(_years) {
    if (_years.length > 0) {
      this.yearAnimations = setTimeout(() => {
        this.setState({ years: this.state.years.concat(_years.shift()) });
        this.animateYears(_years);
      }, 40);
    }
  }

  hideYears() {
    clearTimeout(this.yearAnimations);
    this.setState({ showYears: false, years: [] });
    this.hideMonths();
  }

  getDatesForYear(year) {
    return _.filter(this.props.dates, date => {
      // date format is YYYY-MM-DD
      return date.slice(0, 4) === year.toString();
    }).reverse();
  }

  render() {
    let yearComponents;
    let monthComponents;
    let headerColor = 'white';

    if (this.state.showYears) {
      headerColor = 'mediumaquamarine';

      yearComponents = _.map(this.state.years, year => {
        let isCurrentYear = this.props.currentDate.slice(0, 4) === year.toString().slice(0, 4);
        return <Year isCurrentYear={isCurrentYear} key={year} year={year} yearDates={this.getDatesForYear(year)} showMonths={this.showMonths} setChartDate={this.props.setChartDate}/>;
      });
    }

    if (this.state.showMonths) {
      headerColor = 'mediumaquamarine';

      monthComponents = _.map(this.state.months, month => {
        let isCurrentMonth;

        if (this.state.year.toString() === this.props.currentDate.slice(0, 4) && month === moment(this.props.currentDate).format('MMMM')) {
          isCurrentMonth = true;
        }
        return <Month key={month} month={month} dates={this.props.dates} year={this.state.year} setChartDate={this.props.setChartDate} isCurrentMonth={isCurrentMonth}/>;
      });
    }

    return (
      <div className="decade" onMouseLeave={this.hideYears}>
          <span className="decadeHeader" onMouseEnter={this.showYears} style={{ color: headerColor }}>{this.props.decade}</span>
          <div className="decadeYears">
            {yearComponents}
          </div>
          <div className="months">
            {monthComponents}
          </div>
      </div>
    );
  }
}

export default Decade;
