import React, { Fragment } from 'react';
import logo from './logo.svg';
import './Content.css';
import Image from './Image.jsx';
import axios from 'axios';
import listReactFiles from 'list-react-files'

const START_OFFSET = 20;

export default class Content extends React.Component {

  constructor(props) {
    super(props);
    this.handleScroll = this.handleScroll.bind(this);
    this.state = {
      toShow: [],
      limit: START_OFFSET,
      offset: 0,
      maxOffset: 0,
      gettingMoreImages: false
    }
  }

  getImages() {
    console.log("getImages")
    if(this.state.gettingMoreImages) return;
    this.setState({ gettingMoreImages: true })
    let limit = this.state.limit;
    let offset = this.state.offset;
    let maxOffset = this.state.maxOffset;
    axios.get('http://localhost:80/acoldone/images.php?limit='+limit+'&offset='+offset).then(res => {
      let data = res["data"];
      let toShow = this.state.toShow;
      offset += START_OFFSET;
      maxOffset = (offset > maxOffset) ? offset : maxOffset;
      data.map(x => toShow.push(x));
      this.setState({
        toShow: toShow,
        offset: offset,
        gettingMoreImages: false,
        maxOffset: maxOffset
      });
      localStorage.setItem('toShow', JSON.stringify(toShow));
      localStorage.setItem('offset', offset);
    });
  }

  componentWillUnmount() {
    /*localStorage.setItem('toShow', []);
    localStorage.setItem('offset', 0);*/
  }

  handleScroll() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      console.log("handle scroll")
      this.getImages();
    } 
  }

  componentWillUnmount() {
    console.log("anmoint")
    window.removeEventListener('scroll', this.handleScroll, false);
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll, false);
    window.onbeforeunload = function() {
      localStorage.clear();
    }

    let toShow = localStorage.getItem('toShow');
    if(toShow == null || toShow == undefined || toShow == '') {
      toShow = [];
    } else {
      toShow = JSON.parse(toShow);
    }

    this.setState({
        toShow: toShow,
    });

    let offset = Number(localStorage.getItem('offset'));

    if(toShow.length == 0 && offset == 0) {
      console.log("length 0")
      this.getImages();
      return;
    } else if(offset != null) {
      this.setState({
        offset: offset,
      });
      console.log("hre")
      return;
    } 
    console.log("end of mount")
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
        <div className="idxImageTopWrapper">
          <div className="idxImageWrapper">
            <Image name={data[0]}
                  id={data[1]} />
          </div>
          <div className="separator">
          </div>
        </div>
      </Fragment>
    )
  }

  showImages() {
    const { toShow } = this.state;
    if(toShow == undefined || !toShow) {
      return "";
    }
    let toReturn = [];
    let i = 0;
    while(i < toShow.length) {
      let four = [];
      let j = 0;
      while(j < 4 && i+j < toShow.length) {
        four.push(
          this.nameAndBr(1 % 4 == 0, [toShow[i+j]["name"], toShow[i+j]["id"]])
        );
        j++;
      }
      
      toReturn.push(
        <div className="four">
          {four}
        </div>
      )
      i += 4;
    }
    return (
              <Fragment>
                <div className="allWrapper">
                  {toReturn}
                </div>
              </Fragment>
    )
  }

  render() {
    const { toShow } = this.state;
    return (
        <Fragment>
            Latest photos uploaded!@!@
            <br />
            <div className="allWrapper">
              {this.showImages()}
            </div>
        </Fragment>
      );
  }

}

