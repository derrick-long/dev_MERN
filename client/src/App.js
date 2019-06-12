import React, { Component } from 'react';
import{ BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import jwt_decode from 'jwt-decode';
import setAuthToken from './utils/setAuthToken';
import { setCurrentUser } from './actions/authActions';
import { logoutUser } from './actions/authActions';
import { clearCurrentProfile } from './actions/profileActions';
import store from './store';

import PrivateRoute from './components/common/PrivateRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';


import './App.css';

// check for token 
if(localStorage.jwtToken){
  // set auth token header
  setAuthToken(localStorage.jwtToken);
  //decode 
  const decoded = jwt_decode(localStorage.jwtToken);
  // set user/authenticate
  store.dispatch(setCurrentUser(decoded));
  //check for expired token 
  const currentTime = Date.now() /1000;
  if(decoded.exp < currentTime) {
    //logout user
    store.dispatch(logoutUser());
    //clear current profile 
    store.dispatch(clearCurrentProfile());
    //redirect to login
    window.location.href = '/login'
  }
}

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className="App">
            <Navbar />
            <Route exact path= "/" component={Landing} /> 
            <div className="container">
              <Route exact path="/register" component={Register} />
              <Route exact path="/login" component={Login} />
              <Switch>
                <PrivateRoute exact path="/dashboard" component={Dashboard} />
              </Switch>
            </div>
           <Footer />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
