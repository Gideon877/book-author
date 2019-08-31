/* eslint-disable indent */
'use strict';
var jwt = require('jsonwebtoken');

beforeAll(() => {

});

test('Blank Test', () => {
    let token = getToken();   
    // console.log(token);
     
    let result = verifyToken(token);
    expect(result.name).toBe('token');
    expect(true).toBeTruthy();
});

/**
 * @returns {Boolean}
 */
function getToken() {
    return jwt.sign({ name: 'token' }, 'secret', { expiresIn: '1d'});
}

/**
 * @param {String} token
 * @returns {Boolean}
 */
function verifyToken(token) {
    return jwt.verify(token, 'secret');
}