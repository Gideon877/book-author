'use strict';

const bunyan = require('bunyan');
var log = bunyan.createLogger({ name: "startup" });
const { sequelize } = require('./src/postgres/models');
const { Client } = require('pg');

const client = new Client({
  password: "postgres",
  user: "postgres",
  host: "devtest.cm4z5hf5dtlv.eu-west-1.rds.amazonaws.com",
});

const createDB = async () => { //ifnotex
  await client.connect();
  try {
    log.info({}, "Trying to create database if it does not exist");
    await client.query('CREATE DATABASE impactDB;');
  } catch (e) {
    log.info({}, "DATABASE EXISTS");
    return Promise.resolve();
  } finally{
    client.end();
  }
}

const syncTables = async (cleanStart) => {
  log.info({}, 'SYNCING TABLES');
  // await createDB();
  return sequelize.sync({ force: cleanStart }).then(log.info('Tables are synced')).catch(error => log.error({ error }, 'Error Syncing Tables'))
}

module.exports = { syncTables }
