# BillboardTopTen

[BillboardTopTen][heroku] is a web application that allows music enthusiasts to explore Billboard's top ten charts throughout history. Inspired by [Billboard charts][Billboard], BillboardTopTen is built using Ruby on Rails on the backend, React.JS on the Front-end, and a PostgreSQL database.

![BillboardTopTenImage](public/ImageForReadMe.jpg?raw=true "BillboardTopTenImage")

[heroku]: https://billboardtopten.herokuapp.com/
[Billboard]: http://www.billboard.com/charts

## BillboardTopTen Features

* Dynamic visualization of Billboard's top ten charts for every week
* Week's top song playing while charts are displayed
* Smooth music fade in fade out transitions between different charts
* Date Picker for user exploration of top ten charts through history
* Genre Picker for user exploration of different music genres
* Album Images associated with each artist on the chart


## BillboardTopTen Walk-through

### BillboardTopTen Web Scraping and Search APIs

BillboardTopTen depends on web scraping HTML form [Billboard charts][Billboard] to retrieve all of the charts. A Python script using [billboard.py][billboardpy] API for accessing music charts was written to scrape ten songs for each chart. Each song in a chart contained the following fields: title, artist, weeks, rank, spotifyId, and spotifyLink.

[billboardpy]: https://github.com/guoguo12/billboard-charts

#### Sample Web Scraping Script Snippet

```python
import billboard
from time import sleep

f = open('edm.txt', 'w')

i = 0
chart = billboard.ChartData('dance-electronic-songs')
while chart.previousDate:
    print chart.date
    if len(chart) < 10:
        chart = billboard.ChartData('dance-electronic-songs', chart.previousDate)

    f.write("*****")
    f.write("\n")
    f.write(chart.date)
    f.write("\n")

    for x in range(0, 10):
        f.write(str(chart[x].title))
        f.write("\n")

        f.write(str(chart[x].artist))
        f.write("\n")

    ...
```

Similarly, scraping is done to retrieve track samples from iTunes, and album images for the top songs in each week.

#### Sample iTunes Search API Script Snippet

```ruby
def get_itunes_track(query)
  res = HTTP.get("https://itunes.apple.com/search?term=#{query}&country=us&limit=1&media=music")
  if res.code == 200
    JSON.parse(res)
  else
    p "GOT 403"
    return {"resultCount" => 0}
  end
end

def build_query(chart, spotify_id)
  begin
    track = JSON.parse(HTTP.get("https://api.spotify.com/v1/tracks/#{spotify_id}").to_s)
    title = track['name'].gsub(/[^0-9a-zA-Z ]/, "").split(" ").join("+")
    artist = track['artists'][0]['name'].gsub(/[^0-9a-zA-Z ]/, "").split(" ").join("+");
  rescue
    title = chart[0]['title'].gsub(/[^0-9a-zA-Z ]/, "").split(' ').join('+')
    artist = chart[0]['artist'].gsub(/[^0-9a-zA-Z ]/, "").split(' ').join('+')
  ensure
    return [title, artist].join("+");
  end
end

trackMeta = {}

charts = JSON.parse(File.read("public/charts/electric/billboard-data.json"))

charts.each do |date, chart|
  sleep 2
  p date

    top_song = chart[0]
    query = build_query(chart, top_song['spotify_id'])
    response = get_itunes_track(query)
    i = 1
    until response["resultCount"] != 0 || i == 10
      query = build_query(chart, chart[i])
      response = get_itunes_track(query)
      i += 1
    end
    if (response["resultCount"] > 0)
      itunes_track = response["results"][0]
      unless trackMeta[itunes_track['trackId']]
        trackMeta[date] = { 'previewUrl' => itunes_track['previewUrl'], 'albumImg' => itunes_track['artworkUrl100'] }
      end
    end
end

File.write("public/charts/electric/previewUrls.json", JSON.generate(trackMeta))
```

### Data Visualization and Graphing

BillboardTopTen takes advantage of React.JS rapid render library for smooth visualization of Billboard's charts. There are two separate React components in charge of data visualization for BillboardTopTen: Charts component and Graph component.

The first component is the charts component. This component displays a track's progression over time by drawing out distinct lines following a tracks ranking. Using a set velocity, the lines are animated across the screen.

<!-- ![ChartsComponent](public/ChartsComponent.png?raw=true) -->
#### Sample Charts Code Snippet

```javascript
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
 ...
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
```


The second component is the graph component. this component is in charge of rendering ten album images and track names according to their ranking for a given week. Updates in state coupled with CSS transitions will change positions of tracks.


<!-- ![GraphComponent](public/GraphComponent.png?raw=true) -->
#### Sample Graph Code Snippet

```javascript
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
```

### Music

BillboardTopTen plays music synchronously with it's visuals. For every week, BillboardTopTen will play the number one ranked track in the background. Through the used of React Sound library, sound component's containing track URL's will play music.

BillboardTopTen makes use of React's rapid state handling to control which component is playing music and at what volume. BillboardTopTen is able to seamless fade in fade out track samples.

#### Sample Music Snippet

```javascript
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
...
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
...
```
### Date and Genre Picker

A feature of BillboardTopTen that can keep users engaged for extended periods of time is the ability to explore different music genres and dates for Billboard's charts.

#### Date Picker Code Snippet
```javascript
...
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
...
```
