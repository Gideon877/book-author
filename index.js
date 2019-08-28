const express = require('express');
const app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: 'book-library-service' });
const port = process.env.BOOK_LIBRARY_SERVICE_PORT || 8000;
let TIMEOUT = process.env.TIMEOUT || 30; // seconds for timeout
const { syncTables } = require('./startup');
const { sequelize } = require('./src/postgres/models/');
const _ = require('lodash');
const { Author, User, Category, Book } = require('./src/postgres/models')


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
app.post('/signin', async (req, res) => {
  const { username, password } = req.body;
  // console.log(req.body, username, password);
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
    // console.log(e);
    res.status(500).send(`Error occurred: ${e.message}`);
  }

});

app.post('/signup', async (req, res) => {
  try {
    let data = req.body;
    const username = data.username
    let [user, created] = await User.findOrCreate({
      where: { username }, defaults: req.body
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
});

// Author endpoint
app.get('/author', async (req, res) => {
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
});

app.post('/author', async (req, res) => {
  try {
    let { firstName, surname } = req.body;
    let [user, created] = await Author.findOrCreate({
      where: { firstName, surname }, defaults: {
        firstName, surname
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
});

app.put('/author/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, surname } = req.body
    let result = await Category.findOne({
      where: { authorId: id }
    }).then(category => {
      if (_.isEmpty(category)) { throw new Error(`Not found`) }
      category.update({
        firstName, surname
      }).then((task) => task)
    })

    res.status(200).send({
      category: result,
      message: `updated successfully`
    })
  } catch (error) {
    log.warn(error)
    res.status(500).send('Error occurred');
  }
});

app.delete('/author/:id', async (req, res) => {
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
});

app.get('/author/:id', async (req, res) => {
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
});

// Book endpoint
app.get('/book', async (req, res) => {
  try {
    const books = await Book.findAll().then((results) => results).catch(() => []);
    res.status(200).send({
      message: 'found books',
      books
    });
  } catch (error) {
    log.warn(error)
    res.status(500).send('Error occurred');
  }
});

app.post('/book', async (req, res) => {
  try {
    let { name } = req.body;
    let [book, created] = await Book.findOrCreate({
      where: { name }, defaults: req.body
    });
    if (_.isEmpty(created)) throw new Error(`Failed to add book`);

    res.status(200).send({
      message: `created book name: ${name}`,
      book
    });

  } catch (error) {
    log.warn(error)
    res.status(500).send('Error occurred');
  }
});

app.put('/book/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category } = req.body
    let result = await Book.findOne({
      where: { bookId: id }
    }).then(book => {
      if (_.isEmpty(book)) { throw new Error(`Not found`) }
      book.update({
        name, category
      }).then((task) => task)
    })

    res.status(200).send({
      book: result,
      message: `updated successfully`
    })
  } catch (error) {
    log.warn(error)
    res.status(500).send('Error occurred');
  }
});

app.delete('/book/:id', async (req, res) => {
  try {
    const { id } = req.params;
    Book.findOne({
      where: { bookId: id }
    }).then((book) => {
      book.destroy({ force: true })
    }).catch((err) => {
      throw new Error(err)
    });
  } catch (error) {
    log.warn(error)
    res.status(500).send('Error occurred');
  }
});

app.get('/book/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findOne({
      where: {
        bookId: id
      }
    }).then(result => result).catch((err) => {
      throw new Error(err)
    });
    res.status(200).send({ book, message: 'found book', })
  } catch (error) {
    log.warn(error)
    res.status(500).send('Error occurred');
  }
});

// Category endpoint
app.get('/category', async (req, res) => {
  try {
    const category = await Category.findAll().then((results) => results).catch(() => []);
    res.status(200).send({
      message: 'found category',
      category
    });
  } catch (error) {
    log.warn(error)
    res.status(500).send('Error occurred');
  }
});

app.post('/category', async (req, res) => {
  try {
    let { name } = req.body;
    let [category, created] = await Category.findOrCreate({
      where: { name }, defaults: req.body
    });
    if (_.isEmpty(created)) throw new Error(`Failed to add category`);

    res.status(200).send({
      message: `created category name: ${name}`,
      category
    });

  } catch (error) {
    log.warn(error)
    res.status(500).send('Error occurred');
  }
});

app.put('/category/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body
    let result = await Category.findOne({
      where: { categoryId: id }
    }).then(category => {
      if (_.isEmpty(category)) { throw new Error(`Not found`) }
      category.update({
        name, description
      }).then((task) => task)
    })

    res.status(200).send({
      category: result,
      message: `updated successfully`
    })
  } catch (error) {
    log.warn(error)
    res.status(500).send('Error occurred');
  }
});

app.delete('/category/:id', async (req, res) => {
  try {
    const { id } = req.params;
    Category.findOne({
      where: { categoryId: id }
    }).then((category) => {
      category.destroy({ force: true })
    }).catch((err) => {
      throw new Error(err)
    });
  } catch (error) {
    log.warn(error)
    res.status(500).send('Error occurred');
  }
});
app.get('/category/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findOne({
      where: {
        categoryId: id
      }
    }).then(result => result).catch((err) => {
      throw new Error(err)
    });

    res.status(200).send({ category, message: 'found category', })
  } catch (error) {
    log.warn(error)
    res.status(500).send('Error occurred');
  }
});

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