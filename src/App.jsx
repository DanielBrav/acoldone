import React, { useState, Fragment } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import Content from './Content.jsx';
import ShowImage from './ShowImage.jsx';
import * as Consts from './Consts.jsx';
import Image from './Image.jsx';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams
} from "react-router-dom";

const DEBUG = true;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadClosed: true,
      chosenFile: 'File not chosen',
      chosen: true,//false,
      loaded: 0,
      chosenOld: '',
      uploaded: false,
      newFileName: '',
      confirmProgress: 0,
      taggedPeople: [],
      searchInput: '',
      searchPeople: [],
      failReason: '',
      error: false,
      description: ''
    }
  }
  
  uploadClicked(open) {
    this.setState({ uploadClosed: !open, chosenFile: '', chosen: false, loaded: 0, uploaded: false,
                    description: '' });
  }

  isIdExist(peopleArr, id) {
    let exists = false;
    for(let i = 0; i < peopleArr.length; i++) 
      if(peopleArr[i][1] == id)
        return true;
    return false;
  }

  handleFileChange(event) {
    this.setState({ chosenFile: event.target.files[0], chosen: true });
    const data = new FormData();
    data.append("fileToUpload", event.target.files[0]);
    data.append("submit", 1);

    axios.post(Consts.UPLOAD_HREF + 'uploadImage.php', data, 
        {       
          onUploadProgress: ProgressEvent => {
                              this.setState({
                                loaded: (ProgressEvent.loaded / ProgressEvent.total*100),
                              })
                          },
                          headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                          }
        }).then((res) => { this.handleFileUploaded(res); });
  }

  handleFileUploaded(res) {
    let res_response = String(res["data"]);
    console.log(res);
    console.log(res["data"]);
    let error = false;
    let failReason = '';
    if(res_response.includes("Error")) {
      // We have an error.
      console.log("An error occured");
      error = true;
      failReason = res_response;
    }
    this.setState({
      uploaded: !error,
      newFileName: res["data"],
      error: error,
      failReason: failReason
    });

  }

  generateChooseFile() {
    if(this.state.uploaded) return "";
    return (
      <label className="inputLabel">
      CHOOSE FILE
      <input type="file" style={{ display: 'none' }} onChange={(e) => this.handleFileChange(e)} 
              name="fileToUpload" id="fileToUpload" />
      </label>
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
    let taggedPeople = this.state.taggedPeople;
    if(!this.isIdExist(taggedPeople, x[1])) {
      taggedPeople.push(x);
      this.setState({ taggedPeople: taggedPeople });
    }
  }

  removeFromTaggedPeople(x) {
    let taggedPeople = this.state.taggedPeople;
    if(taggedPeople.includes(x)) {
      taggedPeople = taggedPeople.filter(y => x != y);
      this.setState({ taggedPeople: taggedPeople });
    }
    
  }

  setDesc(e) {
    this.setState({ description: e.target.value });
  }

  generateSampleImage() {
    const name = this.state.newFileName;
    console.log("image name: " + name);
    let searchPeople = this.state.searchPeople.filter(x => !this.isIdExist(this.state.taggedPeople, x[1]));
    return (
      this.state.error ? this.state.failReason :
      <div className="sampleImageWrapper">
        <div className="sampleImage">
          <Image name={name} />
        </div>
        <div className="tagPeople">
          <div className="tagPeopleTitle">
            Description
          </div>
          <div className="tagInput">
            <textarea style={{ resize: 'none', width: '100%' }} onKeyUp={(event) => this.setDesc(event)}/>
          </div>
          <div className="tagPeopleTitle">
            Tag people
          </div>
          <div className="taggedPeopleInSample">
            {this.state.taggedPeople.map(x => {
              return (
                <div className="person" onClick={() => this.removeFromTaggedPeople(x)}>
                  {"#" + x[0]}
                </div>
              )
            })}
          </div>
          <div className="tagInput">
            <input type="text" onKeyUp={(event) => this.handleSearch(event)}/>
            <div className="addButton">ADD</div>
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
        </div>
      </div>
    )
  }

  showProgress() {
    const percent = Number(this.state.loaded).toFixed();
    const greenw = percent; 
    const greyw = 100-percent;
    console.log(greenw, greyw)
    const greenWidth = String(greenw) + '%';
    const greyWidth = String(greyw) + '%';
    return (
      <div className="progressBarWrap" style={{ display: 'flex' }}>
        <div className="progressText">
          Upload progress:&nbsp;
        </div>
        <div className="progressBar" style={{ width: '30vw', display: 'flex', fontSize: '1.2vw' }}>
          {percent}%&nbsp;
          <div className="green" style={{ height: '1.5vw', minWidth: greenWidth, backgroundColor: '#916dd5' }} />
          <div className="gray" style={{ height: '1.5vw', minWidth: greyWidth, backgroundColor: 'rgba(192,192,192,0.3)'  }} />
        </div>
      </div>
    )
  }
  
  confirmClicked() {
    const { chosen, uploaded } = this.state;
    if(!chosen || !uploaded) return;
    let taggedPeople = this.state.taggedPeople;
    let taggedString = "";
    taggedPeople.map(x => taggedString += x[1] + ",");
    const data = new FormData();
    data.append("name", this.state.newFileName);
    data.append("taggedPeople", taggedString);
    data.append("description", this.state.description);
    data.append("submit", 1);

    axios.post(Consts.UPLOAD_HREF + 'uploadConfirmed.php', data, 
        {       
          onUploadProgress: ProgressEvent => {
                              this.setState({
                                confirmProgress: (ProgressEvent.loaded / ProgressEvent.total*100),
                              })
                          },
                          headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                          }
        }).then((res) => { this.uploadClicked(false) });
  }

  discardClicked() {
    const data = new FormData();
    data.append("name", this.state.chosenFile.name);
    data.append("submit", 1);
    if(this.state.uploaded) {
      axios.post(Consts.UPLOAD_HREF + 'uploadDiscarded.php', data, 
          {       
                            headers: {
                              'Content-Type': 'application/json',
                              'Access-Control-Allow-Origin': '*'
                            }
          }).then((res) => { this.uploadClicked(false) });
    } else {
      this.uploadClicked(false);
    }
  }


  generateUploadBox() {
    return (
        <div className="upload" style={{ display: this.state.uploadClosed && 'none' }}>
          <div className="box">
            <div className="closeButton" onClick={() => this.uploadClicked(false)}>
              <b>X</b>
            </div>
            <div className="boxContent">
              <div className="boxTitle">
                Upload a photo
              </div>
              <div className="fileStuff">
                {this.generateChooseFile()}
                <div className="chosenFile">
                  {this.state.chosenFile.name}
                </div>
              </div>
              <div className="showProgress" style={{ display: !this.state.chosen && 'none',
                                                     paddingTop: '2vw' }}>
                {this.showProgress()}
              </div>
              <div className="uploadedImage" style={{ paddingTop: '2vw' }}>
                {(this.state.uploaded || this.state.error) && this.generateSampleImage()}
              </div>
            </div>
            <div className="confirmOrDiscardWrapper">
              <div className="confirmOrDiscard">
                <div className="confirm" onClick={() => this.confirmClicked()}>
                  CONFIRM
                </div>
                <div className="space" />
                <div className="discard" onClick={() => this.discardClicked()}>
                  DISCARD
                </div>
              </div>
            </div>
          </div>
        </div>
    )
  }

  render() {
    return (
      <div className="App">
        {this.generateUploadBox()}
        <div className="header">
          <div className="logo">
            <div className="big">
              <div>photos & stuff</div>
            </div>
            <div className="small">
              The ultimate place to put photos. And stuff.
            </div>
          </div>  
          {/*
          <div className="uploadaphoto">
            <div style={{ cursor: 'pointer' }} onClick={() => this.uploadClicked(true)}>
              <b>Upload a photo</b>
            </div>
          </div>
          */}
        </div>
        <div className="body">
          <Router>
            <Switch>
              <Route path="/photo/:photoId" component={ShowImage} />
              <Route path="/">
                <Content uploadClicked={this.uploadClicked.bind(this)} />
              </Route>
            </Switch>
          </Router>
        </div>
      </div>
    );
  }
}

