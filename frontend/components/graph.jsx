import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

import Track from './track.jsx';

class Graph extends React.Component{
  constructor(props){
    super(props);
  }

  render() {
    const stagingAreaRank = 11;
    const currentTracks = _.map(this.props.chart, 'title'); // title must act as primary key
    const nextChartTracks = _.map(this.props.nextChart, 'title'); // title must act as primary key

    const trackComponents = _.map(this.props.chart, track => {
      let nextTrackRank = nextChartTracks.indexOf(track.title) + 1; // index 0 should be rank 1, etc...

      if (nextTrackRank === 0) {
        nextTrackRank = stagingAreaRank; // if track is not in next week's charts, animate to bottom of list
      }
      let albumImage = this.props.albumImages[`${track.artist}/${track.title}`];
      albumImage = albumImage ? albumImage : 'http://24.media.tumblr.com/tumblr_m3j315A5l31r6luwpo1_500.png';
      return <Track key={track.title} track={track} nextTrackRank={nextTrackRank} albumImage={albumImage} getColorForTitle={this.props.getColorForTitle}/>;
    });

    let tracksOnDeck = _.filter(this.props.nextChart, trackOnDeck => {
      return !(_.includes(currentTracks, trackOnDeck.title));
    });

    const trackOnDeckComponents = tracksOnDeck.map(trackOnDeck => {
      // renders the track to the staging area at the bottom of the list
      const dummyTrack = {
        title: trackOnDeck.title,
        rank: stagingAreaRank
      };

      let albumImage = this.props.albumImages[`${trackOnDeck.artist}/${trackOnDeck.title}`];
      albumImage = albumImage ? albumImage : 'http://24.media.tumblr.com/tumblr_m3j315A5l31r6luwpo1_500.png';

      return <Track key={trackOnDeck.title} track={dummyTrack} nextTrackRank={trackOnDeck.rank} albumImage={albumImage} getColorForTitle={this.props.getColorForTitle}/>;
    });

    return (
      <div id='graph'>
        <ul id='trackList'>
          {trackComponents}
          {trackOnDeckComponents}
        </ul>
        <div id='stagingArea'/>
      </div>
    );
  }
}

export default Graph;
