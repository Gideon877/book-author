'use strict';
const _ = require('lodash');
const uuid = require('uuid');
const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'book-library-service' });
const {User} = require('../postgres/models');
const Auth = require('./auth');

module.exports = function (Book) {
  const Authenticate = Auth(User);

  const findBooks = async (req, res) => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    const [page, pageSize ] = [ 1, 5]; //[req.query.page, req.query.pageSize] ||;    
    const offset = page * pageSize;
    const limit = offset + pageSize;
    try {
      await Authenticate.verifyToken(token);
      const books = await Book.findAll({limit, offset}).then((results) => results).catch(() => []);
      res.status(200).send({
        message: 'found books',
        books
      });
    } catch (error) {
      log.warn(error);
      res.status(500).send('Error occurred');
    }
  };

  const addBook = async (req, res) => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    try {
      await Authenticate.verifyToken(token);
      let { name, category, authorId } = req.body;
      name = _.capitalize(name);
      category = _.capitalize(category);
      let data = { bookId: uuid.v4(), name, category, authorId };
      let [book, created] = await Book.findOrCreate({
        where: { name, authorId }, defaults: data
      });

      if (!created) throw new Error(`Failed to add book. Book name:${name} already exist.`);

      res.status(200).send({
        message: `created book name: ${name}`,
        book: book.get({ plain: true })
      });

    } catch (error) {
      log.warn({ error });
      res.status(500).send(error);
    }
  };

  const updateBook = async (req, res) => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    try {
      await Authenticate.verifyToken(token);
      const { id } = req.params;
      const { name, category } = req.body;
      let result = await Book.findOne({
        where: { bookId: id }
      }).then(book => {
        if (_.isEmpty(book)) { throw new Error('Not found'); }
        book.update({
          name, category
        }).then((task) => task);
      });

      res.status(200).send({
        book: result,
        message: 'updated successfully'
      });
    } catch (error) {
      log.warn(error);
      res.status(500).send('Error occurred');
    }
  };

  const removeBook = async (req, res) => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    try {
      await Authenticate.verifyToken(token);
      const { id } = req.params;
      await Book.findOne({
        where: { bookId: id }
      }).then(async (book) => {
        await book.destroy({ force: true }).then();
      }).catch((err) => {
        throw new Error(err);
      });
    } catch (error) {
      log.warn(error);
      res.status(500).send('Error occurred');
    }
  };

  const getBook = async (req, res) => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    try {
      await Authenticate.verifyToken(token);
      const { id } = req.params;
      const book = await Book.findOne({
        where: {
          bookId: id
        }
      }).then(result => result);
      if (_.isEmpty(book)) throw new Error(`Failed to get book with id:${id}.`);
      res.status(200).send({ book, message: 'found book', });
    } catch (error) {
      log.warn(error);
      res.status(500).send({ message: error.message, book: {} });
    }
  };

  const getBookByCategory = async (category) => {
    return Book.findOne({where: { category }});
  };

  const getBookByAuthorId = async (authorId) => {
    return Book.findOne({where: { authorId }});
  };

  return {
    findBooks, getBookByCategory, getBookByAuthorId,
    addBook, updateBook, getBook, removeBook
  };
};
