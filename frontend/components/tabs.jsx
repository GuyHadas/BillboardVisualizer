import React from 'react';
import ReactDOM from 'react-dom';

import Genres from './genre.jsx';
import DatePicker from './datePicker.jsx';

class Tabs extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      tabIndex: 0
    };

    this.switchTabs = this.switchTabs.bind(this);
  }

  switchTabs(index) {
    this.setState({ tabIndex: index });
  }

  render() {
    let renderedTab = [
      <DatePicker charts={this.props.charts} setChartDate={this.props.setChartDate} currentDate={this.props.currentDate}/>,
      <Genres playGenre={this.props.playGenre} isLoadingGenres={this.props.isLoadingGenres}/>
    ][this.state.tabIndex];

    let genreTabBackgroundColor, genreTabColor, datePickerTabBackgroundColor, datePickerTabColor;
    if (this.state.tabIndex === 0) {
      datePickerTabBackgroundColor = '#FF6961';
      datePickerTabColor = 'black';
    } else {
      genreTabBackgroundColor = '#FF6961';
      genreTabColor = 'black';
    }

    return (
      <div id='tabs'>
        <div id='tabHeaders'>
          <div className="tab"
            onClick={ () => this.switchTabs(0) }
            id='datePickerTab'
            style={{
              backgroundColor: datePickerTabBackgroundColor,
              color: datePickerTabColor
            }}>
            Datepicker
          </div>
          <div
            className="tab"
            onClick={ () => this.switchTabs(1) }
            id='genreTab'
            style={{
              backgroundColor: genreTabBackgroundColor,
              color: genreTabColor
            }}>
            Genre
          </div>
        </div>
        {renderedTab}
      </div>
    );
  }
}

export default Tabs;
