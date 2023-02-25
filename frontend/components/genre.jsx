import React from 'react';
import ReactDOM from 'react-dom';

class Genres extends React.Component{
  constructor(props){
    super(props);
  }

  render() {
    let genreList;

    if (this.props.isLoadingGenres) {
      genreList = <img id='loader' src='loader.gif'/>;
    } else {
      genreList = [
        <div className='genre' id='hot100Genre' onClick={() => this.props.playGenre('hot100')}></div>,
        <div className='genre' id='alternativeGenre' onClick={() => this.props.playGenre('alternative')}></div>,
        <div className='genre' id='hiphopGenre' onClick={() => this.props.playGenre('hiphop')}></div>,
        <div className='genre' id='countryGenre' onClick={() => this.props.playGenre('country')}></div>,
        <div className='genre' id='rapGenre' onClick={() => this.props.playGenre('rap')}></div>,
        <div className='genre' id='electricGenre' onClick={() => this.props.playGenre('electric')}></div>
      ];
    }

    return (
      <div id='genres'>
        {genreList}
      </div>
    );
  }
}

export default Genres;
