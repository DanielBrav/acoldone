import React, { Fragment } from 'react';
import logo from './logo.svg';
import './ShowImage.css';
import axios from 'axios';
import listReactFiles from 'list-react-files'
import Image from './Image.jsx';
import * as Consts from './Consts.jsx';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams
} from "react-router-dom";

const START_OFFSET = 12;
const href = window.location.href.match("http://(.*?)/")[0];

export default class ShowImage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      src: '',
      description: '',
      taggedPeople: []
    }
  }

  componentDidMount() {
    this.getImage();
  }

  getImage() {
    let imageId = this.props.match.params.photoId;
    axios.get(Consts.PHP_HREF + 'images.php?image_id='+imageId).then(res => {
      this.setState({
          src: res["data"][0]["name"],
          description: res["data"][0]["description"],
          taggedPeople: res["data"][1] ? res["data"][1] : []
      });
      
    })
  }

  render() {
    let imageId = this.props.match.params.photoId;
    let src = this.state.src;
    let description = this.state.description;
    if(imageId == undefined) return "";
    if(src == '' || src == undefined) return "";
    return (
        <Fragment>
          <div className="back" onClick={this.props.history.goBack}>
            <svg width="15" height="15" viewBox="0 0 24 24"><path d="M18.885 3.515c-4.617-4.618-12.056-4.676-16.756-.195l-2.129-2.258v7.938h7.484l-2.066-2.191c2.82-2.706 7.297-2.676 10.073.1 4.341 4.341 1.737 12.291-5.491 12.291v4.8c3.708 0 6.614-1.244 8.885-3.515 4.686-4.686 4.686-12.284 0-16.97z"/></svg>
          </div>
          <div className="showImageMainWrapper">
            <div className="showImageWrapper">
              <Image name={src} isBig />
            </div>
            <div className="commentsWrapper">
              <div className="taggedPeople" style={{ display: this.state.taggedPeople.length == 0 && 'none' }}>
                  {this.state.taggedPeople.map(x => {
                    return <span className="taggedPerson">{"#"+x}</span>
                  })}
              </div>
              <div style={{ height: '0.3vw'}} />
              <div className="description">
                {description}
              </div>
              <div className="comments">
                <div className="commentsTitle">
                  Comments
                </div>
              </div>
            </div>
          </div>
        </Fragment>
      );
  }

}

