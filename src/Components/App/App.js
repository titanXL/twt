import React, { Component } from 'react'
import { Router, Route, browserHistory } from 'react-router'
import './App.css'
import Login from '../Login/Login'
import Registration from '../Registration/Registration'
import Twitter from '../Twitter/Twitter'
import NotFound from '../NotFound/NotFound'
import { checkLoggedIn } from '../../utils'
class App extends Component {

  render () {
    return (
      <Router history={browserHistory}>
        <Route path='/' component={Login} />
        <Route path='/registration' component={Registration} />
        <Route path='/twitter' component={Twitter} onEnter={checkLoggedIn} />
        <Route path='*' component={NotFound} />
      </Router>
    )
  }

}

export default App
