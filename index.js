const express = require('express');
const bunyan = require('bunyan');
const app = express();
var bodyParser = require('body-parser');
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const log = bunyan.createLogger({ name: 'book-library-service' });

const port = process.env.BOOK_LIBRARY_SERVICE_PORT || 8000;
let TIMEOUT = process.env.TIMEOUT || 5; // seconds for timeout if we are running the solution using docker-compose
const { syncTables } = require('./startup');
const { sequelize } = require('./src/postgres/models/');
const { Author, User, Category, Book } = require('./src/postgres/models');

const Auth = require('./src/controllers/auth');
const Authors = require('./src/controllers/author');
const Books = require('./src/controllers/book');
const Categories = require('./src/controllers/categories');

const auth = Auth(User);
const author = Authors(Author);
const book = Books(Book);
const category = Categories(Category);

app.post('/hi', async (req, res) => {
  try {

    res.status(200).send({
      message: 'I am running'
    });
  } catch (e) {
    res.status(500).send('Error occurred');
  }
});

app.get('/ping', async (req, res) => {
  const database = await sequelize.query('SELECT 1 + 1').then(() => 'up').catch(() => 'down');
  res.send({
    environment: process.env.NODE_ENV,
    database,
  });
});

// WebAuthentication
app.post('/signin', auth.signIn);
app.post('/signup', auth.signUp);

// Author endpoint
app.get('/author', author.findAuthors);
app.post('/author', author.addAuthor);
app.put('/author/:id', author.updateAuthor);
app.delete('/author/:id', author.removeAuthor);
app.get('/author/:id', author.getAuthor);

// Book endpoint
app.get('/book', book.findBooks);
app.post('/book', book.addBook);
app.put('/book/:id', book.updateBook);
app.delete('/book/:id', book.removeBook);
app.get('/book/:id', book.getBook);

// Category endpoint
app.get('/category', category.findCategories);
app.post('/category', category.addCategory);
app.put('/category/:id', category.updateCategory);
app.delete('/category/:id', category.removeCategory);
app.get('/category/:id', category.getCategory);

(async () => {
  log.info({}, `Pausing ${TIMEOUT} seconds for the database to startup`);
  await wait(TIMEOUT * 100);
  await syncTables(false); // set to true to remove data on startup
  log.info({}, 'Connecting to database....');
  app.listen(port, () => {
    log.info({}, `Started at http://localhost:${port}`);
  });
})();

async function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}