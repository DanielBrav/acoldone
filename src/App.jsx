import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';
import Content from './Content.jsx';
import ShowImage from './ShowImage.jsx';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams
} from "react-router-dom";

function App() {
  return (
    <div className="App">
      <div className="header">
        <div className="logo">
          <div className="big">
            <div>AC</div>
          </div>
          <div className="small">
            OLD
          </div>
          <div className="big">
            O
          </div>
          <div className="small">
            NE
          </div>
        </div>  
      </div>
      <div className="body">
        <Router>
          <Switch>
            <Route path="/photo/:photoId" component={ShowImage} />
            <Route path="/">
              <Content />
            </Route>
          </Switch>
        </Router>
      </div>
    </div>
  );
}

export default App;
