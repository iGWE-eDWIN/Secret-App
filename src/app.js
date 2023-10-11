//jshint esversion:6
'use strict';
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const userRouter = require('./router/user');
require('./db/mongoose');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', './views');
app.set('view engine', 'ejs');

// Register Routers
app.use(userRouter);

// Home route
app.get('/', (req, res) => {
  res.render('home');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
