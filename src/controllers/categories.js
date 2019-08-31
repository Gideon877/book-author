'use strict';
const _ = require('lodash');
const uuid = require('uuid');
const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'book-library-service' });
const { User, Book } = require('../postgres/models');
const Auth = require('./auth');
const BookApi = require('./book');

module.exports = function (Category) {
  const Authenticate = Auth(User);
  const Books = BookApi(Book);

  const findCategories = async (req, res) => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    // console.log(req.query);
    const [page, pageSize ] = [ 1, 5]; //[req.query.page, req.query.pageSize] ||;    
    const offset = page * pageSize;
    const limit = offset + pageSize;
    try {
      await Authenticate.verifyToken(token);
      const category = await Category.findAll({limit, offset})
        .then((results) => results)
        .catch(() => []);

      res.status(200).send({
        message: 'found category',
        category
      });
    } catch (error) {
      log.warn(error);
      res.status(500).send('Error occurred');
    }
  };

  const addCategory = async (req, res) => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    try {
      await Authenticate.verifyToken(token);
      let { name, description } = req.body;
      name = _.capitalize(name); description = _.capitalize(description);
      let data = { name, categoryId: uuid.v4(), description };
      let [category, created] = await Category.findOrCreate({
        where: { name }, defaults: data
      });

      if (!created) throw new Error('Failed to add category');

      res.status(200).send({
        message: `created category name: ${name}`,
        category
      });

    } catch (error) {
      log.warn(error);
      res.status(500).send('Error occurred');
    }
  };

  const updateCategory = async (req, res) => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    try {
      await Authenticate.verifyToken(token);
      const { id } = req.params;
      const { name, description } = req.body;
      let result = await Category.findOne({
        where: { categoryId: id }
      }).then(category => {
        if (_.isEmpty(category)) { throw new Error('Not found'); }
        category.update({
          name, description
        }).then((task) => task);
      });

      res.status(200).send({
        category: result,
        message: 'updated successfully'
      });
    } catch (error) {
      log.warn(error);
      res.status(500).send('Error occurred');
    }
  };

  const getCategory = async (req, res) => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    try {
      await Authenticate.verifyToken(token);
      const { id } = req.params;
      const category = await Category.findOne({
        where: {
          categoryId: id
        }
      }).then(result => result).catch((err) => {
        throw new Error(err);
      });

      res.status(200).send({ category, message: 'found category', });
    } catch (error) {
      log.warn(error);
      res.status(500).send('Error occurred');
    }
  };

  const removeCategory = async (req, res) => {
    const token = req.headers['x-access-token'] || req.headers['authorization'];
    try {
      await Authenticate.verifyToken(token);
      const { id } = req.params;
      await Category.findOne({
        where: { categoryId: id }
      }).then(async (category) => {
        const { name } = category || '';
        let book = await Books.getBookByCategory(name);
        if (name && _.isEmpty(book)) { 
          category.destroy({ force: true }); 
          res.status(200).send({ message: 'Category deleted!' });
        } else {
          throw new Error(`Failed to delete category with id:${id}`);
        }
      });
    } catch (error) {
      // log.warn(error);
      res.status(500).send(error.message);
    }
  };

  return {
    findCategories,
    addCategory, updateCategory, getCategory, removeCategory
  };
};