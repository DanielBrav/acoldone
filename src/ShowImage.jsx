import React, { Fragment } from 'react';
import logo from './logo.svg';
import './ShowImage.css';
import axios from 'axios';
import listReactFiles from 'list-react-files'
import Image from './Image.jsx';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams
} from "react-router-dom";

const START_OFFSET = 12;

export default class ShowImage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      src: ''
    }
  }

  componentDidMount() {
    this.getImage();
  }

  getImage() {
    let imageId = this.props.match.params.photoId;
    axios.get('http://localhost:80/acoldone/images.php?image_id='+imageId).then(res => {
      console.log(res["data"][0]["name"]);
      this.setState({
          src: res["data"][0]["name"]
      });
      
    })
  }

  render() {
    let imageId = this.props.match.params.photoId;
    let src = this.state.src;
    if(imageId == undefined) return "";
    if(src == '' || src == undefined) return "";
    return (
        <Fragment>
          <Image name={src} isBig />
        </Fragment>
      );
  }

}

