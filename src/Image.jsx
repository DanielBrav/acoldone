import React, { Fragment } from 'react';
import logo from './logo.svg';
import './Content.css';

export default class Image extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      src: ''
    }
  }

  componentDidMount() {
    const images = require.context('./../photos', true);
    const img = images('./' + this.props.name);
    const image = new Image();
    image.src = img;
    image.onload = () => { console.log("hello") }
    this.setState({ src: img });
  }

  setStatus(status) {
    if(!this.state.loading) return;
    this.setState({ loading: status });
  }

  render() {
    const name = this.props.name;
    if(name == undefined) return "undef";
    const loading = this.state.loading;
    const imageStyle = loading ? { display: "none" } : {};
    const img = this.state.src;
    return (
      <Fragment>
        {loading && "loading"}
        <img src={img} style={imageStyle} className="idximg" onLoad={this.setStatus(false)} />
      </Fragment>
    )
  }

}

