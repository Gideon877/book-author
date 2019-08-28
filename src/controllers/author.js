'use strict'
const _ = require('lodash');
const uuid = require("uuid");
const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'book-library-service' });


module.exports = function (Author) {

    const findAuthors = async (req, res) => {
        try {
            const authors = await Author.findAll().then((results) => results).catch(() => []);
            res.status(200).send({
              message: 'found authors',
              authors
            });
          } catch (error) {
            log.warn(error)
            res.status(500).send('Error occurred');
          }
     }

    const addAuthor = async (req, res) => { 
        try {
            let { firstName, surname } = req.body;
            let [user, created] = await Author.findOrCreate({
              where: { firstName, surname }, defaults: {
                firstName, surname, authorId: uuid.v4()
              }
            });
            if (_.isEmpty(created)) throw new Error(`Failed to add user`);
        
            res.status(200).send({
              message: 'created author',
              user
            });
        
          } catch (error) {
            log.warn(error)
            res.status(500).send('Error occurred');
          }
    }

    const updateAuthor = async (req, res) => {
        try {
            const { id } = req.params;
            const { firstName, surname } = req.body
            let result = await Author.findOne({
              where: { authorId: id }
            }).then(author => {
              if (_.isEmpty(author)) { throw new Error(`Not found`) }
              author.update({
                firstName, surname
              }).then((task) => task)
            })
        
            res.status(200).send({
              author: result,
              message: `updated successfully`
            })
          } catch (error) {
            log.warn(error)
            res.status(500).send('Error occurred');
          }
     }

    const getAuthor = async (req, res) => { 
        try {
            const { id } = req.params;
            const author = await Author.findOne({
              where: {
                authorId: id
              }
            }).then(result => result).catch((err) => {
              throw new Error(err)
            });
        
            res.status(200).send({ author, message: 'found author', })
          } catch (error) {
            log.warn(error)
            res.status(500).send('Error occurred');
          }
    }

    const removeAuthor = async (req, res) => { 
        try {
            const { id } = req.params;
            Author.findOne({
              where: { authorId: id }
            }).then((author) => {
              author.destroy({ force: true })
            }).catch((err) => {
              throw new Error(err)
            });
          } catch (error) {
            log.warn(error)
            res.status(500).send('Error occurred');
          }
    }

    return {
        findAuthors, addAuthor, updateAuthor, getAuthor, removeAuthor
    }
}