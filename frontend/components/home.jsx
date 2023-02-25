import React from 'react';
import ReactDOM from 'react-dom';
import { hashHistory } from 'react-router';
import moment from 'moment';
import StringHash from 'string-hash';
import Promise from 'bluebird';
import _ from 'lodash';

import Graph from './graph.jsx';
import Title from './title.jsx';
import Sound from 'react-sound';
import Chart from './chart.jsx';
import Tabs from './tabs.jsx';
import IntroModal from './introModal.jsx';

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      albumImages: {},
      charts: {},
      trackMetaData: {},
      lastChartDate: null,
      twoWeeksBackChartDate: null,
      threeWeeksBackChartDate: null,
      fourWeeksBackChartDate: null,
      currentDate: null,
      nextChartDate: null,
      currentTrackURL: null, //current track playing
      nextTrackURL: null, //next track to be cached
      trackURLSoundComponentOne: null, //track url set on Sound component one
      trackURLSoundComponentTwo: null, //track url set on Sound component two
      soundComponentOneStatus: Sound.status.PLAYING,
      soundComponentTwoStatus: Sound.status.STOPPED,
      volOne: 100,
      volTwo: 0,
      isSoundOn: true,
      genre: 'hot100',
      isModalOpen: true,
      isLoading: true,
      isLoadingGenres: true
    };

    this.incrementCharts = this.incrementCharts.bind(this);
    this.getDate = this.getDate.bind(this);
    this.formatDate = this.formatDate.bind(this);
    this.setChartDate = this.setChartDate.bind(this);
    this.createInterval = this.createInterval.bind(this);
    this.toggleSound = this.toggleSound.bind(this);
    this.handleSongFinishedPlayingOne = this.handleSongFinishedPlayingOne.bind(this);
    this.handleSongFinishedPlayingTwo = this.handleSongFinishedPlayingTwo.bind(this);
    this.isNextSongDifferent = this.isNextSongDifferent.bind(this);
    this.areBothPlaying = this.areBothPlaying.bind(this);
    this.incrementSameTrack = this.incrementSameTrack.bind(this);
    this.incrementDifferentTrack = this.incrementDifferentTrack.bind(this);
    this.fadeInFadeOut = this.fadeInFadeOut.bind(this);
    this.stopInterval = this.stopInterval.bind(this);
    this.startCharts = this.startCharts.bind(this);
    this.playGenre = this.playGenre.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.loadCharts = this.loadCharts.bind(this);
  }

  componentDidMount() {
    this.loadCharts();
  }

  loadCharts() {
    this.loadChart('hot100')
    .then(() => {
      return Promise.all([
        this.loadChart('rap'),
        this.loadChart('alternative'),
        this.loadChart('country'),
        this.loadChart('electric'),
        this.loadChart('hiphop')
      ])
      .then(() => {
        return this.setState({ isLoadingGenres: false });
      });
    });
  }

  loadChart(genre) {
    let charts, albumImages;

    return $.get(`charts/${genre}/charts.json`)
    .then(_charts => {
      charts = _charts;

      return $.get(`charts/${genre}/images.json`);
    })
    .then(_albumImages => {
      albumImages = _albumImages;

      return $.get(`charts/${genre}/previewUrls.json`);
    })
    .then(trackMetaData => {
      let newGenreChart = {};
      newGenreChart[genre] = charts;
      let newCharts = _.extend({}, this.state.charts, newGenreChart);

      let newGenreTrackMetaData = {};
      newGenreTrackMetaData[genre] = trackMetaData;
      let newTrackMetaData = _.extend({}, this.state.trackMetaData, newGenreTrackMetaData);

      let newGenreAlbumImages = {};
      newGenreAlbumImages[genre] = albumImages;
      let newAlbumImages = _.extend({}, this.state.albumImages, newGenreAlbumImages);

      this.setState({
        trackMetaData: newTrackMetaData,
        albumImages: newAlbumImages,
        charts: newCharts
      });

      if (genre === 'hot100') {
        this.setState({ isLoading: false });
      }
    });
  }


  startCharts(genre) {
    this.i = 0;
    const charts =  this.state.charts[genre];
    const trackMetaData = this.state.trackMetaData[genre];

    this.setState({
      fourWeeksBackChartDate: this.getDate(charts, this.i - 4),
      threeWeeksBackChartDate: this.getDate(charts, this.i - 3),
      twoWeeksBackChartDate: this.getDate(charts, this.i - 2),
      lastChartDate: this.getDate(charts, this.i - 1),
      currentDate: this.getDate(charts, this.i),
      nextChartDate: this.getDate(charts, this.i + 1),
      currentTrackURL: trackMetaData[this.getDate(charts, this.i)]['previewUrl'],
      nextTrackURL: trackMetaData[this.getDate(charts, this.i + 1)]['previewUrl']
    });

    if (trackMetaData[this.getDate(charts, 0)]['previewUrl'] !== trackMetaData[this.getDate(charts, 1)]['previewUrl']) {
      this.incrementDifferentTrack(genre);
    } else {
      this.incrementSameTrack(genre);
    }

    this.incrementCharts();
  }

  incrementCharts() {
    this.i = 1;
    this.createInterval();
  }

  incrementDifferentTrack(genre) {
    const currentGenre = genre ? genre : this.state.genre;
    const trackMetaData = this.state.trackMetaData[currentGenre];
    const charts = this.state.charts[currentGenre];

    let volOne = this.activeSoundComponent === 'one' ? 0 : 100;
    let volTwo = this.activeSoundComponent === 'one' ? 100 : 0;
    let soundComponentOneStatus;
    let soundComponentTwoStatus;
    if(this.state.isSoundOn){
      soundComponentOneStatus = this.activeSoundComponent === 'one' ? Sound.status.STOPPED : Sound.status.PLAYING;
      soundComponentTwoStatus = this.activeSoundComponent === 'one' ?  Sound.status.PLAYING : Sound.status.STOPPED;
    } else {
      soundComponentOneStatus = this.activeSoundComponent === 'one' ? Sound.status.STOPPED : this.state.soundComponentOneStatus;
      soundComponentTwoStatus = this.activeSoundComponent === 'one' ?  this.state.soundComponentTwoStatus : Sound.status.STOPPED;
    }
    let trackURLSoundComponentOne = this.activeSoundComponent === 'one' ? trackMetaData[this.getDate(charts, this.i + 1)]['previewUrl'] :
                                              trackMetaData[this.getDate(charts, this.i)]['previewUrl'];
    let trackURLSoundComponentTwo = this.activeSoundComponent === 'one' ? trackMetaData[this.getDate(charts, this.i)]['previewUrl'] :
                                              trackMetaData[this.getDate(charts, this.i + 1)]['previewUrl'];
    this.activeSoundComponent = this.activeSoundComponent === 'one' ? 'two' : 'one';

    this.setState({
      fourWeeksBackChartDate: this.getDate(charts, this.i - 4),
      threeWeeksBackChartDate: this.getDate(charts, this.i - 3),
      twoWeeksBackChartDate: this.getDate(charts, this.i - 2),
      lastChartDate: this.getDate(charts, this.i - 1),
      currentDate: this.getDate(charts, this.i),
      nextChartDate: this.getDate(charts, this.i + 1),
      currentTrackURL: trackMetaData[this.getDate(charts, this.i)]['previewUrl'],
      nextTrackURL: trackMetaData[this.getDate(charts, this.i + 1)]['previewUrl'],
      trackURLSoundComponentOne: trackURLSoundComponentOne,
      trackURLSoundComponentTwo: trackURLSoundComponentTwo,
      soundComponentOneStatus: soundComponentOneStatus,
      soundComponentTwoStatus: soundComponentTwoStatus,
      volOne: volOne,
      volTwo: volTwo
    });
  }

  incrementSameTrack(genre) {
    const currentGenre = genre ? genre : this.state.genre;
    const trackMetaData = this.state.trackMetaData[currentGenre];
    const charts = this.state.charts[currentGenre];

    let volOne = this.activeSoundComponent === 'one' ? 100 : 0;
    let volTwo = this.activeSoundComponent === 'one' ? 0 : 100;
    let trackURLSoundComponentOne = this.activeSoundComponent === 'one' ? trackMetaData[this.getDate(charts, this.i)]['previewUrl'] :
                                              trackMetaData[this.getDate(charts, this.i + 1)]['previewUrl'];
    let trackURLSoundComponentTwo = this.activeSoundComponent === 'one' ? trackMetaData[this.getDate(charts, this.i + 1)]['previewUrl'] :
                                              trackMetaData[this.getDate(charts, this.i)]['previewUrl'];

    this.setState({
      fourWeeksBackChartDate: this.getDate(charts, this.i - 4),
      threeWeeksBackChartDate: this.getDate(charts, this.i - 3),
      twoWeeksBackChartDate: this.getDate(charts, this.i - 2),
      lastChartDate: this.getDate(charts, this.i - 1),
      currentDate: this.getDate(charts, this.i),
      nextChartDate: this.getDate(charts, this.i + 1),
      currentTrackURL: trackMetaData[this.getDate(charts, this.i)]['previewUrl'],
      nextTrackURL: trackMetaData[this.getDate(charts, this.i + 1)]['previewUrl'],
      trackURLSoundComponentOne: trackURLSoundComponentOne,
      trackURLSoundComponentTwo: trackURLSoundComponentTwo,
      volOne: volOne,
      volTwo: volTwo
    });
  }

  createInterval() {
    if (this.nextDateInterval) {
      clearInterval(this.nextDateInterval);
    }
    this.nextDateInterval = setInterval(() => {
      clearInterval(this.fadeOutOneFadeInTwoInterval);
      clearInterval(this.fadeOutTwoFadeInOneInterval);
      if (this.isNextSongDifferent()) {
        this.incrementDifferentTrack();
      } else {
        this.incrementSameTrack();
      }

      this.i += 1;
      if ( this.i >= Object.keys(this.state.charts[this.state.genre]).length - 2) { // Stop incrementing on second to last date
        this.i = 0;
      }
    }, 3000);
  }

  setChartDate(date) {
    const trackMetaData = this.state.trackMetaData[this.state.genre];
    const charts = this.state.charts[this.state.genre];

    this.i = Object.keys(charts).indexOf(date);
    if (this.nextDateInterval) clearInterval(this.nextDateInterval);
    if (this.fadeOutOneFadeInTwoInterval) clearInterval(this.fadeOutOneFadeInTwoInterval);
    if (this.fadeOutTwoFadeInOneInterval) clearInterval(this.fadeOutTwoFadeInOneInterval);

    if ( this.i === Object.keys(charts).length - 1) { // Last song was chosen
      this.i -= 3;
    }

    if (this.state.isSoundOn) {
      this.setState({
        soundComponentOneStatus: this.activeSoundComponent === 'one' ? Sound.status.STOPPED : Sound.status.PLAYING,
        soundComponentTwoStatus: this.activeSoundComponent === 'one' ? Sound.status.PLAYING : Sound.status.STOPPED
      });
    }

    let volOne = this.activeSoundComponent === 'one' ? 0 : 100;
    let volTwo = this.activeSoundComponent === 'one' ? 100 : 0;
    let trackURLSoundComponentOne = this.activeSoundComponent === 'one' ? trackMetaData[this.getDate(charts, this.i + 1)]['previewUrl'] :
                                              trackMetaData[this.getDate(charts, this.i)]['previewUrl'];
    let trackURLSoundComponentTwo = this.activeSoundComponent === 'one' ? trackMetaData[this.getDate(charts, this.i)]['previewUrl'] :
                                              trackMetaData[this.getDate(charts, this.i + 1)]['previewUrl'];

    this.activeSoundComponent = this.activeSoundComponent === 'one' ? 'two' : 'one';

    this.setState({
      fourWeeksBackChartDate: this.getDate(charts, this.i - 4),
      threeWeeksBackChartDate: this.getDate(charts, this.i - 3),
      twoWeeksBackChartDate: this.getDate(charts, this.i - 2),
      lastChartDate: this.getDate(charts, this.i - 1),
      currentDate: this.getDate(charts, this.i),
      nextChartDate: this.getDate(charts, this.i + 1),
      currentTrackURL: trackMetaData[this.getDate(charts, this.i)]['previewUrl'],
      nextTrackURL: trackMetaData[this.getDate(charts, this.i + 1)]['previewUrl'],
      trackURLSoundComponentOne: trackURLSoundComponentOne,
      trackURLSoundComponentTwo: trackURLSoundComponentTwo,
      volOne: volOne,
      volTwo: volTwo
    });

    this.i += 1;
    this.createInterval();
  }

  getDate(charts, index) {
    return Object.keys(charts)[index];
  }

  formatDate(date) {
    return moment(date).format('MMMM D, YYYY');
  }

  isNextSongDifferent(){
    return this.state.currentTrackURL !== this.state.nextTrackURL;
  }

  areBothPlaying() {
    return (this.state.soundComponentTwoStatus === Sound.status.PLAYING) && (this.state.soundComponentOneStatus === Sound.status.PLAYING);
  }

  fadeInFadeOut() {
    if (this.isNextSongDifferent()) {
      if (this.fadeOutOneFadeInTwoInterval) clearInterval(this.fadeOutOneFadeInTwoInterval);
      if (this.fadeOutTwoFadeInOneInterval) clearInterval(this.fadeOutTwoFadeInOneInterval);

      if (this.activeSoundComponent === 'one') {
        this.fadeOutOneFadeInTwoInterval = setInterval(() => {
          this.setState({
            volOne: this.state.volOne - 1.5,
            volTwo: this.state.volTwo + 1.5
          });
        }, (1000 / 30));
      } else {
        this.fadeOutTwoFadeInOneInterval = setInterval(() => {
          this.setState({
            volOne: this.state.volOne + 1.5,
            volTwo: this.state.volTwo - 1.5
          });
        }, (1000 / 30));
      }
    }
  }

  componentDidUpdate() {
    if ((this.isNextSongDifferent() && !this.areBothPlaying()) && this.state.isSoundOn) {

      this.fadeInFadeOut();
      let trackURLSoundComponentOne = this.activeSoundComponent === 'one' ? this.state.currentTrackURL : this.state.nextTrackURL;
      let trackURLSoundComponentTwo = this.activeSoundComponent === 'one' ? this.state.nextTrackURL : this.state.currentTrackURL;

      this.setState({
        trackURLSoundComponentOne: trackURLSoundComponentOne,
        trackURLSoundComponentTwo: trackURLSoundComponentTwo,
        soundComponentOneStatus: Sound.status.PLAYING,
        soundComponentTwoStatus: Sound.status.PLAYING
      });
    }
  }

  handleSongFinishedPlayingOne() {
    this.setState({ trackURLSoundComponentOne: this.state.trackURLSoundComponentOne});
  }

  handleSongFinishedPlayingTwo() {
    this.setState({ trackURLSoundComponentTwo: this.state.trackURLSoundComponentTwo});
  }

  songComponentOne(trackURLSoundComponentOne) {
    if(trackURLSoundComponentOne){
      return <Sound playStatus={this.state.soundComponentOneStatus}
                    volume={this.state.volOne}
                    url={this.state.trackURLSoundComponentOne}
                    onFinishedPlaying={this.handleSongFinishedPlayingOne}/>;
    }
  }

  songComponentTwo(trackURLSoundComponentTwo) {
    if(trackURLSoundComponentTwo){
      return <Sound playStatus={this.state.soundComponentTwoStatus}
                    url={this.state.trackURLSoundComponentTwo}
                    volume={this.state.volTwo}
                    onFinishedPlaying={this.handleSongFinishedPlayingTwo}/>;
    }
  }

  toggleSound() {
    if (this.state.isSoundOn) {
      this.setState({
        soundComponentOneStatus: Sound.status.PAUSED,
        soundComponentTwoStatus: Sound.status.PAUSED,
        isSoundOn: false
      });
    } else {
      if (this.activeSoundComponent === 'one') {
        this.setState({
          soundComponentOneStatus: Sound.status.PLAYING,
          isSoundOn: true
        });
      } else {
        this.setState({
          soundComponentTwoStatus: Sound.status.PLAYING,
          isSoundOn: true
        });
      }
    }
  }

  getColorForTitle(trackTitle) {
    let hash = StringHash(trackTitle);

    let colors = [
      '#FEF59E', // yellow
      '#98CC9F', // lime green
      '#998AC0', // dark purple
      '#8AD2F4', // turquoise
      '#F4B589', // red orange
      '#C897C0', // light purple
      '#FFB347', // orange
      '#B1E2DA', // teal
      '#FF6961', // red
      '#779ECB', // navy blue
      '#DEA5A4', // light red
      '#CBFFCB',  // light green
    ];

    return colors[hash % colors.length];
  }

  stopInterval() {
    clearInterval(this.nextDateInterval);
  }

  playGenre(genre) {
    if (genre !== this.state.genre) {
      this.setState({ genre: genre });
      this.startCharts(genre);
    }
  }

  closeModal() {
    this.setState({ isModalOpen: false });
    this.activeSoundComponent = 'one';
    this.startCharts(this.state.genre);
  }

  render() {
    const currentChart = this.state.charts[this.state.genre];

    let graphComponent;
    let audioComponent;
    let datePickerComponent;
    let titleBoxComponent;
    let chartComponent;
    let tabsComponent;

    if (currentChart && this.state.currentTrackURL) {
      titleBoxComponent = <Title
        date={this.formatDate(this.state.currentDate)}
        artist={currentChart[this.state.currentDate][0].artist}
        toggleSound={this.toggleSound}
        isSoundOn={this.state.isSoundOn}
        genre={this.state.genre}
        />;

      graphComponent = <Graph
        date={this.state.currentDate}
        chart={currentChart[this.state.currentDate]}
        nextChart={currentChart[this.state.nextChartDate]}
        albumImages={this.state.albumImages[this.state.genre]}
        getColorForTitle={this.getColorForTitle}
        />;
      const trackURLSoundComponentOne = this.state.trackURLSoundComponentOne;
      const trackURLSoundComponentTwo = this.state.trackURLSoundComponentTwo;

      audioComponent =
        <div>
          {this.songComponentOne(trackURLSoundComponentOne)}
          {this.songComponentTwo(trackURLSoundComponentTwo)}
        </div>;

      tabsComponent = <Tabs
        charts={currentChart}
        setChartDate={this.setChartDate.bind(this)}
        currentDate={this.state.currentDate}
        playGenre={this.playGenre}
        isLoadingGenres={this.state.isLoadingGenres}/>;

      chartComponent = <Chart
        chart={currentChart[this.state.currentDate]}
        nextChart={currentChart[this.state.nextChartDate]}
        prevChart={currentChart[this.state.lastChartDate]}
        twoWeeksBackChart={currentChart[this.state.twoWeeksBackChartDate]}
        threeWeeksBackChart={currentChart[this.state.threeWeeksBackChartDate]}
        fourWeeksBackChart={currentChart[this.state.fourWeeksBackChartDate]}
        getColorForTitle={this.getColorForTitle}
        currentDate={this.state.currentDate}
        nextChartDate={this.state.nextChartDate}
        prevChartDate={this.state.lastChartDate}
        twoWeeksBackChartDate={this.state.twoWeeksBackChartDate}
        threeWeeksBackChartDate={this.state.threeWeeksBackChartDate}
        fourWeeksBackChartDate={this.state.fourWeeksBackChartDate}
        />;
    }
    return (
      <div>
        {titleBoxComponent}
        <IntroModal isModalOpen={this.state.isModalOpen} onRequestClose={this.closeModal} isLoading={this.state.isLoading}/>
        <section id='mainContainer'>
          {tabsComponent}
          {chartComponent}
          {graphComponent}
        </section>
        {audioComponent}
      </div>
    );
  }
}

export default Home;
