'use strict';
const _ = require('lodash');
const uuid = require('uuid');
const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'book-library-service' });

module.exports = function (Category) {


  const findCategories = async (req, res) => {
    try {
      const category = await Category.findAll().then((results) => results).catch(() => []);
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
    try {
      let { name, description } = req.body;
      let data = { name, categoryId: uuid.v4(), description };
      let [category, created] = await Category.findOrCreate({
        where: { name }, defaults: data
      });

      if (_.isEmpty(created)) throw new Error('Failed to add category');

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
    try {
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
    try {
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
    try {
      const { id } = req.params;
      Category.findOne({
        where: { categoryId: id }
      }).then((category) => {
        category.destroy({ force: true });
      }).catch((err) => {
        throw new Error(err);
      });
    } catch (error) {
      log.warn(error);
      res.status(500).send('Error occurred');
    }
  };

  return {
    findCategories,
    addCategory, updateCategory, getCategory, removeCategory
  };
};