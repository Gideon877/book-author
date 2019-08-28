# book-library-service

[![Build Status](https://travis-ci.org/Gideon877/book-author.svg?branch=master)](https://travis-ci.org/Gideon877/book-author)

Description

### Tech

Bubble Sort Service uses a number of open source projects to work properly:
* [node.js] - evented I/O for the backend
* [Express] - fast node.js network app framework [@tjholowaychuk]
* [eslint](https://eslint.org/) - The pluggable linting utility for JavaScript and JSX
* [husky](https://www.npmjs.com/package/husky) - Git hooks made easy
* [Docker](https://www.docker.com/) - Building and Running Containers
* [node-docker](https://github.com/tarampampam/node-docker) - Small Docker Image to run node application - tarampampam/node:alpine
* [Jest](https://jestjs.io/) - Unit Testing
* [TravisCI](https://docs.travis-ci.com) - CI Server

### Installation

Bubble Sort Service requires [Node.js](https://nodejs.org/) v6+ to run.

To build the container locally

```sh
$ yarn
$ yarn build-docker
```

Install the dependencies and devDependencies and start the server.

Once you have it up and running you can simply test it by 

```sh
$ curl -X POST \
  http://localhost:8000/ping \

```
# book-author
