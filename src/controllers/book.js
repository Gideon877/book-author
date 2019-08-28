'use strict';
const _ = require('lodash');
const uuid = require('uuid');
const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'book-library-service' });

module.exports = function (Book) {

  const findBooks = async (req, res) => {
    try {
      const books = await Book.findAll().then((results) => results).catch(() => []);
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
    try {
      let { name, category, authorId } = req.body;
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
    try {
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
    try {
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
    try {
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

  return {
    findBooks,
    addBook, updateBook, getBook, removeBook
  };
};
