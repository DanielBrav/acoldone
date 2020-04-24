import React, { Fragment } from 'react';
import logo from './logo.svg';
import './Content.css';
import Image from './Image.jsx';
import axios from 'axios';
import listReactFiles from 'list-react-files'

const START_OFFSET = 12;

export default class Content extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      toShow: [],
      limit: START_OFFSET,
      offset: 0,
      gettingMoreImages: false
    }
  }

  getImages() {
    let limit = this.state.limit;
    let offset = this.state.offset;
    let gettingMoreImages = this.state.gettingMoreImages;
    if(gettingMoreImages) return;
    this.setState({ gettingMoreImages: true });
    axios.get('http://localhost:80/acoldone/images.php?limit='+limit+'&offset='+offset).then(res => {
      let data = res["data"];
      let toShow = this.state.toShow;
      offset += START_OFFSET;
      data.map(x => toShow.push(x));
      this.setState({
        toShow: toShow,
        offset: offset,
        gettingMoreImages: false
      });
    })
  }
  
  componentDidMount() {
    window.addEventListener('scroll', () => {
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        this.getImages();
      } 
    });

    if (document.body.scrollHeight <= window.innerHeight) {
      this.getImages();
    }

    console.log(document.body.scrollHeight)

    const { limit } = this.state;
    this.getImages();

  }


  insertAllToDB() {  // Temporary function!!!
    console.log("inserting all to db");
    const images = require.context('./../photos', true);
    images.keys().forEach(function(key){
      axios.get('http://localhost:80/acoldone/insertName.php?name='+key.substring(2));
    });
  }

  nameAndBr(toBr, data) {
    return (
      <Fragment>
        <Image name={data} />
        {toBr ? <br /> : ' ' }
      </Fragment>
    )
  }

  showImages() {
    const { toShow } = this.state;
    if(toShow == undefined || !toShow) {
      return "";
    }
    let toReturn = "";
    return toShow.map((obj, i) => {
                                    return (this.nameAndBr((i+1) % 4 == 0, obj["name"]));
                      });
  }

  render() {
    const { toShow } = this.state;
    return (
        <Fragment>
            Latest photos uploaded
            <br />
            {this.showImages()}
        </Fragment>
      );
  }

}

