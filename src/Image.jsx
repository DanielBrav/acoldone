import React, { Fragment } from 'react';
import logo from './logo.svg';
import './Content.css';
import * as Consts from './Consts.jsx';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams
} from "react-router-dom";



export default class Image extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      src: '',
      error: false
    }
  }

  /*componentDidMount() {
    const imageName = this.props.name;
    console.log("image name in Image.jsx: " + imageName);
    this.setState({ src: Consts.IMAGE_HREF + 'photos/' + imageName });
  }*/

  setStatus(status) {
    if(status == 2) {
      this.setState({ error: true });
      return;
    }
    if(!this.state.loading) return;
    this.setState({ loading: status });
  }

  render() {
    const name = this.props.name;// "IMG-20161112-WA0013.jpg";//
    const id = this.props.id;
    const isBig = this.props.isBig;
    const error = this.state.error;
    if(name == undefined) return "undef";
    const loading = this.state.loading;
    const imgClass = isBig ? "bigimg" : "idximg";
    const imageStyle = loading ? { display: "none" } : {};
    const src = Consts.IMAGE_HREF + 'photos/' + name;
    let link = "./photo/" + id;
    return (
      <Fragment>
        {loading ? 
          error ? "Error loading." :
            <div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
         : ""}
        {!isBig && id ? 
        <Link to={link}>
          <img src={src} style={imageStyle} className={imgClass} onLoad={() => this.setStatus(false)}
                                                                 onError={() => this.setStatus(2)} />
        </Link> 
        :
          <img src={src} style={imageStyle} className={imgClass} onLoad={() => this.setStatus(false)}
                                                                 onError={() => this.setStatus(2)}/>
        }
      </Fragment>
    )
  }

}

