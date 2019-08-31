'use strict';
const _ = require('lodash');
const uuid = require('uuid');
const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'book-library-service' });
const bcrypt = require('bcrypt');
const BCryptRounds = 6;
const jwt = require('jsonwebtoken');

module.exports = function (User) {

  const signIn = async (req, res) => {
    const { username, password } = req.body;
    try {
      if (_.isEmpty(username) || _.isEmpty(password)) {
        throw new Error('Fields can\'t be empty!');
      }
      const accessGranted = await canLogin({ password, username });
      if (!accessGranted) {
        throw new Error(`Access denied for username '${username}'!`);
      }
      
      let user = await User.findOne({
        where: { username }
      });
      const token = await getToken();

      res.status(200).header('x-auth-token', token).send({
        message: 'Authentication granted',
        user
      });
    } catch (e) {
      log.warn(e);
      res.status(500).send(e);
    }
  };

  const signUp = async (req, res) => {
    try {
      let { username, password } = req.body;
      password = await HashPassword(password);
      let data = {
        username,
        userId: uuid.v4(),
        email: req.body.email,
        firstName: _.capitalize(req.body.firstName),
        surname: _.capitalize(req.body.surname),
        password
      };

      let [user, created] = await User.findOrCreate({
        where: { username }, defaults: data
      });

      if (!created) {
        throw new Error('User already exists');
      }

      res.status(200).send({
        message: 'created user',
        user
      });

    } catch (error) {
      // log.warn(error)
      res.status(500).send(error);
    }
  };

  /**
 * @param  {String} password
 */
  const HashPassword = param => {
    const password = _.isString(param) ? param : param.toString();
    return bcrypt
      .genSalt(BCryptRounds)
      .then(salt => {
        return bcrypt.hash(password, salt).then(result => {
          return result;
        });
      })
      .catch(err => {
        return err;
      });
  };

  /**
 * @param  {Object} param
 * @param  {String} param.password
 * @param  {Object} param.user
 * @param  {String} param.user.password
 */
  const DecryptPassword = param => {
    let { password, user } = param || {};
    return bcrypt
      .compare(password, user.password)
      .then(result => {
        return result;
      })
      .catch(err => {
        return err;
      });
  };

  /**
     * @param  {Object} param
     * @param  {Object} param.password
     * @param  {Object} param.username
     * 
     * @returns {Boolean}
     */
  const canLogin = async (param) => {
    if (_.isEmpty(param) || !param) return false;
    if (!param.password || !param.username) return false;
    const { password, username } = param;
    return getUserByUsername(username)
      .then(async (user) => (user)
        ? await DecryptPassword({ password, user })
        : false);
  };

  const getUserByUsername = (username) => {
    return User.findOne({ where: { username } });
  };

  /**
 * @returns {Boolean}
 */
  function getToken() {
    return jwt.sign({ name: 'token' }, 'secret', { expiresIn: '1h'});
  }

  /**
* @param {String} token
* @returns {Boolean}
*/
  function verifyToken(token) {
    if(_.isEmpty(token)) throw new Error('Token not provided');
    const tokenValue = token.split(' ');
    if(tokenValue.length > 1) {
      token = tokenValue[1];
    }
    return jwt.verify(token, 'secret');
  }

  return {
    signIn,
    signUp,
    getToken,
    verifyToken
  };
};