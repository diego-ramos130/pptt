
'use strict';
require('dotenv').config();
const pg = require('pg');
const express = require('express');
const PORT = process.env.PORT;
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));

app.get('/', initializeHomePage)

function initializeHomePage(req,res){
  res.render('pages/main');
}

app.listen(PORT, () => console.log(`server hath started on port ${PORT}`));