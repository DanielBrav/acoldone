import React, { Fragment } from 'react';
import logo from './logo.svg';
import './Content.css';
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


  componentDidMount() {
    const images = require.context('./../photos', true);
    const img = images('./' + this.props.name);
    this.setState({ src: img });
  }

  setStatus(status) {
    if(status == 2) {
      this.setState({ error: true });
      return;
    }
    if(!this.state.loading) return;
    this.setState({ loading: status });
  }

  render() {
    const name = this.props.name;
    const id = this.props.id;
    const isBig = this.props.isBig;
    const error = this.state.error;
    if(name == undefined) return "undef";
    const loading = this.state.loading;
    const imgClass = isBig ? "bigimg" : "idximg";
    const imageStyle = loading ? { display: "none" } : {};
    const img = this.state.src;
    let link = "./photo/" + id;
    return (
      <Fragment>
        {loading ? 
          error ? "Error loading." :
            <div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
         : ""}
        {!isBig ? 
        <Link to={link}>
          <img src={img} style={imageStyle} className={imgClass} onLoad={() => this.setStatus(false)}
                                                                 onError={() => this.setStatus(2)} />
        </Link> 
        :
          <img src={img} style={imageStyle} className={imgClass} onLoad={() => this.setStatus(false)}
                                                                 onError={() => this.setStatus(2)}/>
        }
      </Fragment>
    )
  }

}

