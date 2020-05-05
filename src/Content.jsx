import React, { Fragment } from 'react';
import logo from './logo.svg';
import './Content.css';
import Image from './Image.jsx';
import axios from 'axios';
import listReactFiles from 'list-react-files'
import * as Consts from './Consts.jsx';

const START_OFFSET = 20;

export default class Content extends React.Component {

  constructor(props) {
    super(props);
    this.handleScroll = this.handleScroll.bind(this);
    this.state = {
      toShow: [],
      loadedIds: [],
      limit: START_OFFSET,
      offset: 0,
      maxOffset: 0,
      gettingMoreImages: false,
      isFilterApplied: false,
      filterDesc: '',
      filterComm: '',
      filterPeople: [],
      searchPeople: [],
      searchInput: '',
      displayFilter: false
    }
  }

  getImages() {
    console.log("getImages")
    if(this.state.gettingMoreImages) return;
    this.setState({ gettingMoreImages: true })
    let { limit, offset, maxOffset, loadedIds, filterDesc, isFilterApplied, filterPeople } = this.state;
    let params = '?limit='+limit+'&offset='+offset;

    if(isFilterApplied) {
      params += '&filterOn=true';
    }
    
    let isFiltered = false;

    if(filterDesc != "") {
      params += '&byDesc='+filterDesc;
      isFiltered = true;
    }

    if(filterPeople.length > 0) {
      let peopleIds = "";
      filterPeople.map(x => peopleIds += x[1] + ",");
      params += '&byPeople='+peopleIds;
      isFiltered = true;
    }

    axios.get(Consts.PHP_HREF + 'images.php' + params).then(res => {
      let data = res["data"];
      let toShow = this.state.toShow;
      if(data.length == 0) {
        this.setState({ gettingMoreImages: false });
        return;
      } 

      let addToOffset = data.length;
      offset += data.length; //START_OFFSET;
      maxOffset = (offset > maxOffset) ? offset : maxOffset;
      data.map(x => {
                      if(!loadedIds.includes(x["id"])) {
                          toShow.push(x);
                          loadedIds.push(x["id"]);
                        }
                      })
      this.setState({
        toShow: Array.from(new Set(toShow)),
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
    if ((window.innerHeight + window.scrollY)+50 >= document.body.offsetHeight) {
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


 /* insertAllToDB() {  // Temporary function!!!
    console.log("inserting all to db");
    const images = require.context('./../photos', true);
    images.keys().forEach(function(key){
      axios.get('http://localhost:80/acoldone/insertName.php?name='+key.substring(2));
    });
  }*/

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

  handleSearch(e) {
    let value = e.target.value;
    axios.get(Consts.PHP_HREF + 'searchPeople.php?input=' + value).then(res =>
      {
        let searchPeople = []
        res["data"].map(p => searchPeople.push([p["name"], p["id"]]));
        this.setState({ searchPeople: searchPeople, searchInput: value });
      })
  }

  addTaggedPerson(x) {
    let filterPeople = this.state.filterPeople;
    if(!this.isIdExist(filterPeople, x[1])) {
      filterPeople.push(x);
      this.setState({ filterPeople: filterPeople });
    }
  }

  isIdExist(peopleArr, id) {
    let exists = false;
    for(let i = 0; i < peopleArr.length; i++) 
      if(peopleArr[i][1] == id)
        return true;
    return false;
  }

  removeFromTaggedPeople(x) {
    let filterPeople = this.state.filterPeople;
    if(filterPeople.includes(x)) {
      filterPeople = filterPeople.filter(y => x != y);
      this.setState({ filterPeople: filterPeople });
    }
  }

  generateSearchPeople() {
    let searchPeople = this.state.searchPeople.filter(x => !this.isIdExist(this.state.filterPeople, x[1]));
    return (
      <Fragment>
        <div className="taggedPeopleInContent">
          {this.state.filterPeople.map(x => {
            return (
              <span className="personContentFilter" onClick={() => this.removeFromTaggedPeople(x)}>
                {"#" + x[0]}
              </span>
            )
          })}
        </div>
        <div className="tagInputFilterWrap">
          <input type="text" className="tagInputFilter" onKeyUp={(event) => this.handleSearch(event)}/>
        </div>
        <div className="searchBox" style={{ display: this.state.searchInput.length == 0 && 'none' }}>
          {searchPeople.map(x => {
            return (
                <div className="personSearchBox" onClick={() => { this.addTaggedPerson(x) }}>
                  {x[0]}
                </div>
            )
          })}
        </div>
      </Fragment>
    )
  }

  filterClicked() {
    this.setState({ isFilterApplied: true, offset: 0, toShow: [], loadedIds: [] }, () => this.getImages());
  }

  resetClicked() {
    this.setState({ isFilterApplied: false, offset: 0, toShow: [], loadedIds: [],
                    filterDesc: '',
                    filterComm: '',
                    filterPeople: [],
                    searchPeople: [],
                    searchInput: '' }, () => this.getImages());
  }

  descFilterChange(e) {
    this.setState({ filterDesc: e.target.value });
  }

  generateMenu() {
    return (
      <Fragment>
        <div className="filterBar">
          <div className="filterHeadLine" style={{ paddingLeft: this.state.displayFilter && '0vw' }}
          onClick={() => this.setState({ displayFilter: !this.state.displayFilter })}>
            Filter photos
            <span className="plusMinus">{this.state.displayFilter ? " -" : " +"}</span>
          </div>
          <div className="allButHeadLine" style={{ display: !this.state.displayFilter && 'none',
                                                  paddingLeft: this.state.displayFilter && '0vw' }}>
            <div className="byDescWrap">
              <div className="filterHeadLineSmall">
                By description
              </div>
              <div className="filterInputWrap">
                <textarea className="filterInput" onKeyUp={(event) => this.descFilterChange(event)} />
              </div>
            </div>
            <div className="byCommentsWrap">
              <div className="filterHeadLineSmall">
                By comments content
              </div>
              <div className="filterInputWrap">
                <textarea className="filterInput" />
              </div>
            </div>
            <div className="byPeopleWrap">
              <div className="filterHeadLineSmall">
                By tagged people (up to 10)
              </div>
              <div className="filterInputWrap">
                {this.generateSearchPeople()}
              </div>
            </div>
            <div className="outerFilterButton">
              <div className="filterButton" onClick={() => this.filterClicked()}>
                FILTER
              </div>
            </div>
            <div className="outerResetButton" style={{ display: !this.state.isFilterApplied && 'none' }}
                                              onClick={() => this.resetClicked()}>
              <div className="filterButton resetButton">
                RESET
              </div>
            </div>
          </div>
        </div>
        <div className="uploadaphoto">
          <div style={{ cursor: 'pointer' }}>
            <div className="uploadAPhotoHeadLine" onClick={() => this.props.uploadClicked(true)}>
              Upload a photo&nbsp;
            <span className="plusMinus">+</span>
            </div>
          </div>
        </div>
      </Fragment>
    )
  }
  render() {
    const { toShow } = this.state;
    return (
        <Fragment>
            <div className="contentWrapper">
              <div className="menu">
                {this.generateMenu()}
              </div>
              <div className="allWrapper">
                {this.showImages()}
              </div>
            </div>
        </Fragment>
      );
  }

}

