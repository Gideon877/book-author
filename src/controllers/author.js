'use strict';
const _ = require('lodash');
const uuid = require('uuid');
const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'book-library-service' });
const { User, Book } = require('../postgres/models');
const Auth = require('./auth');
const BookApi = require('./book');

module.exports = function (Author) {
  const Authenticate = Auth(User);
  const Books = BookApi(Book);

  const findAuthors = async (req, res) => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    const [page, pageSize ] = [ 1, 5]; //[req.query.page, req.query.pageSize] ||;    
    const offset = page * pageSize;
    const limit = offset + pageSize;
    try {
      await Authenticate.verifyToken(token);
      const authors = await Author.findAll({limit, offset}).then((results) => results).catch(() => []);
      res.status(200).send({
        message: 'found authors',
        authors
      });
    } catch (error) {
      log.warn(error);
      res.status(500).send('Error occurred');
    }
  };

  const addAuthor = async (req, res) => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    try {
      await Authenticate.verifyToken(token);
      let { firstName, surname } = req.body;
      _.capitalize(firstName);
      _.capitalize(surname);
      let [user, created] = await Author.findOrCreate({
        where: { firstName, surname }, defaults: {
          firstName, surname, authorId: uuid.v4()
        }
      });
      if (!created) throw new Error('Failed to add user');

      res.status(200).send({
        message: 'created author',
        user
      });

    } catch (error) {
      log.warn(error);
      res.status(500).send('Error occurred');
    }
  };

  const updateAuthor = async (req, res) => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    try {
      await Authenticate.verifyToken(token);
      const { id } = req.params;
      const { firstName, surname } = req.body;
      _.capitalize(firstName);
      _.capitalize(surname);
      let result = await Author.findOne({
        where: { authorId: id }
      }).then(author => {
        if (_.isEmpty(author)) { throw new Error('Not found'); }
        author.update({
          firstName, surname
        }).then((task) => task);
      });

      res.status(200).send({
        author: result,
        message: 'updated successfully'
      });
    } catch (error) {
      log.warn(error);
      res.status(500).send('Error occurred');
    }
  };

  const getAuthor = async (req, res) => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    try {
      await Authenticate.verifyToken(token);
      const { id } = req.params;
      const author = await Author.findOne({
        where: {
          authorId: id
        }
      }).then(result => result).catch((err) => {
        throw new Error(err);
      });

      res.status(200).send({ author, message: 'found author', });
    } catch (error) {
      log.warn(error);
      res.status(500).send('Error occurred');
    }
  };

  const removeAuthor = async (req, res) => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    try {
      await Authenticate.verifyToken(token);
      const { id } = req.params;
      await Author.findOne({
        where: { authorId: id }
      }).then(async (author) => {
        let book = await Books.getBookByAuthorId(id);
        if (author && _.isEmpty(book)) {
          author.destroy({ force: true });
          res.status(200).send({ message: 'Author deleted!' });
        } else {
          throw new Error(`Failed to delete author with id:${id}`);
        }

      });
    } catch (error) {
      // log.warn(error);
      res.status(500).send(error.message);
    }
  };

  return {
    findAuthors, addAuthor, updateAuthor, getAuthor, removeAuthor
  };
};