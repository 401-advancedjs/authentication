'use strict';
/**
 * Authentication middleware
 * @module 
 */

const User = require('./users-model.js');

module.exports = (req, res, next) => {

  try {

    let [authType, encodedString] = req.headers.authorization.split(/\s+/);
    console.log(req.headers);
    // BASIC Auth  ... Authorization:Basic ZnJlZDpzYW1wbGU=

    switch(authType.toLowerCase()) {
    case 'basic':
      return _authBasic(encodedString);
    default:
      return _authError();
    }

  } catch(e) {
    return _authError();
  }

  /**
   * Takes in base64 string containing username:password and authenticates user
   * @param {string} authString 
   */
  function _authBasic(authString) {
    let base64Buffer = Buffer.from(authString,'base64'); // <Buffer 01 02...>
    let bufferString = base64Buffer.toString(); // john:mysecret
    let [username,password] = bufferString.split(':');  // variables username="john" and password="mysecret"
    let auth = {username,password};  // {username:"john", password:"mysecret"}

    return User.authenticateBasic(auth)
      .then( user => _authenticate(user) );
  }

  /**
   * Generate token for user - adds username and token to request object
   * @param {object} user 
   */
  function _authenticate(user) {
    if ( user ) {
      req.user = user;
      req.token = user.generateToken();
      next();
    }
    else {
      _authError();
    }
  }
  /**
   * Unauthorized invalid username/password handler
   */
  function _authError() {
    next({status: 401, statusMessage: 'Unauthorized', message: 'Invalid User ID/Password'});
  }

};

