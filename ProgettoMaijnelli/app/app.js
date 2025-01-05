const express = require('express');
const session = require('express-session');
const api = require('./api/api');
const db = require('./db');
const app = express();

app.use(session({
  secret: 'Segretissimo!!!',
  resave: false,
  saveUninitialized: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/api', api);
app.listen(3000, async () => {
  console.log("Server in ascolto sulla porta 3000...");
  await db.connect2db();
});