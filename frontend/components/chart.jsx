import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

import Line from './line.jsx';
import GraphDate from './graphDate.jsx';

class Chart extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      offset: 0
    };
  }

  componentDidMount() {
    // This is called 150 times throughout a chart interval
    // Line must move 175 pixels every chart interval
    const VELOCITY = (175 / 75);
    this.offsetInterval = setInterval(() => {
      this.setState({ offset: this.state.offset + VELOCITY });
    }, 40);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.chart !== this.props.chart) {
      this.setState({ offset: 0 });
    }
  }

  componentWillUnmount() {
    clearInterval(this.offsetInterval);
  }

  getPositionForRank(rank) {
    return rank * 55;
  }

  getLinesForSection(sectionNum, startingChart, endingChart) {
    const STAGING_AREA_RANK = 11;
    const startingTracks = _.map(startingChart, 'title');
    const endingTracks = _.map(endingChart, 'title');
    const tracksOnDeck = _.filter(endingChart, trackOnDeck => {
      return !(_.includes(startingTracks, trackOnDeck.title));
    });

    let lines = _.map(startingChart, track => {
      let nextTrackRank = endingTracks.indexOf(track.title) + 1; // index 0 should be rank 1, etc...

      if (nextTrackRank === 0) {
        nextTrackRank = STAGING_AREA_RANK; // if track is not in next week's charts, animate to bottom of list
      }

      return <Line
        offset={this.state.offset}
        color={this.props.getColorForTitle(track.title)}
        key={`${track.title}sec${sectionNum}rank${track.rank}`}
        weekPosition={sectionNum}
        y1={this.getPositionForRank(track.rank)}
        y2={this.getPositionForRank(nextTrackRank)}/>;
    });

    const tracksOnDeckLines = tracksOnDeck.map(trackOnDeck => {
      return <Line
        offset={this.state.offset}
        color={this.props.getColorForTitle(trackOnDeck.title)}
        key={`${trackOnDeck.title}sec${sectionNum}rank${trackOnDeck.rank}`}
        weekPosition={sectionNum}
        y1={this.getPositionForRank(STAGING_AREA_RANK)}
        y2={this.getPositionForRank(trackOnDeck.rank)}/>;
    });

    return lines.concat(tracksOnDeckLines);
  }

  render() {
    const sectionZero = this.getLinesForSection(0, this.props.chart, this.props.nextChart);
    const sectionOne = this.getLinesForSection(1, this.props.prevChart, this.props.chart);
    const sectionTwo = this.getLinesForSection(2, this.props.twoWeeksBackChart, this.props.prevChart);
    const sectionThree = this.getLinesForSection(3, this.props.threeWeeksBackChart, this.props.twoWeeksBackChart);
    const sectionFour = this.getLinesForSection(4, this.props.fourWeeksBackChart, this.props.threeWeeksBackChart);

    return (
      <div id="chart-wrap-wrapper">
        <div id="chart-wrap">
          <ul id="chart-y-axis">
            <li>1 &mdash;</li>
            <li>2 &mdash;</li>
            <li>3 &mdash;</li>
            <li>4 &mdash;</li>
            <li>5 &mdash;</li>
            <li>6 &mdash;</li>
            <li>7 &mdash;</li>
            <li>8 &mdash;</li>
            <li>9 &mdash;</li>
            <li>10 &mdash;</li>
          </ul>
          <svg width={700} height={579} style={{ borderBottom: '1px solid white', backgroundColor: 'transparent' }}>
            {sectionZero}
            {sectionOne}
            {sectionTwo}
            {sectionThree}
            {sectionFour}
          </svg>
        </div>
        <svg width={700} height={50} style={{ backgroundColor: 'rgb(0, 0, 0)', color: 'white', marginLeft: 'auto' }}>
          <GraphDate offset={this.state.offset} weekPosition={-1} date={this.props.nextChartDate}/>
          <GraphDate offset={this.state.offset} weekPosition={0} date={this.props.currentDate}/>
          <GraphDate offset={this.state.offset} weekPosition={1} date={this.props.prevChartDate}/>
          <GraphDate offset={this.state.offset} weekPosition={2} date={this.props.twoWeeksBackChartDate}/>
          <GraphDate offset={this.state.offset} weekPosition={3} date={this.props.threeWeeksBackChartDate}/>
          <GraphDate offset={this.state.offset} weekPosition={4} date={this.props.fourWeeksBackChartDate}/>
        </svg>
      </div>
    );
  }
}

export default Chart;
