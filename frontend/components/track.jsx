import React from 'react';
import ReactDOM from 'react-dom';

class Track extends React.Component{

  constructor(props) {
    super(props);
    this.calculateDistanceFromTop = this.calculateDistanceFromTop.bind(this);
    this.state = { top: this.calculateDistanceFromTop(this.props.track.rank) };
  }

  calculateDistanceFromTop(rank) {
    return (Number(rank) * 55) + 25;
  }

  componentDidMount() {
    this.setState({ top: this.calculateDistanceFromTop(this.props.track.rank) });
  }

  componentDidUpdate() {
    this.animateTrackTimeout = setTimeout(() => {
      if (this.state.top !== this.calculateDistanceFromTop(this.props.nextTrackRank)) {
        this.setState({ top: this.calculateDistanceFromTop(this.props.nextTrackRank) });
      }
    } , 90); // this plus css transition time must equal setIntervalTime from #incrementCharts
  }

  componentWillUnmount() {
    clearTimeout(this.animateTrackTimeout);
  }

  render() {
    const distanceFromTop = this.state.top;
    let boxShadow = `0px 0px 20px 1px ${this.props.getColorForTitle(this.props.track.title)}`;

    return (
      <div className='trackBox' style={{
          top: distanceFromTop,
          position: 'absolute'
        }}>
        <img className='albumImage'
             src={this.props.albumImage}
             style={{
               border: `1px solid ${this.props.getColorForTitle(this.props.track.title)}`,
               boxShadow: boxShadow
             }}
             width='50'
             height='50'
             />
        {this.props.track.title}
      </div>
    );
  }
}

export default Track;
