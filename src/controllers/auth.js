'use strict'
const _ = require('lodash');
const uuid = require("uuid");
const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'book-library-service' });


module.exports = function (User) {

    const signIn = async (req, res) => {
        const { username, password } = req.body;
        try {
            if (_.isEmpty(username) || _.isEmpty(password)) {
                throw new Error(`Fields can't be empty!`);
            }
            let user = await User.findOne({
                where: { username, password }
            });

            (_.isEmpty(user)) ?
                res.status(500).send(`User not found`) :
                res.status(200).send({
                    message: 'Authentication successful',
                    user
                });
        } catch (e) {
            res.status(500).send(`Error occurred: ${e.message}`);
        }
    }
    const signUp = async (req, res) => {
        try {
            let { username } = req.body;
            let data = {
                username,
                userId: 1 || uuid.v4() || 11, 
                email: req.body.email,
                firstName: req.body.firstName,
                surname: req.body.surname,
                password: req.body.password
            }

            let [user, created] = await User.findOrCreate({
                where: { username }, defaults: data
            });

            if (_.isEmpty(created)) {
                throw new Error(`User already exists`);
            }

            res.status(200).send({
                message: 'created user',
                user
            });

        } catch (error) {
            // log.warn(error)
            res.status(500).send(`Error occurred:${error}`);
        }
    }

    return {
        signIn,
        signUp
    }
}