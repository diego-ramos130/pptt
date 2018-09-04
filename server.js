
'use strict';
require('dotenv').config();
const pg = require('pg');
const express = require('express');
const PORT = process.env.PORT;
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);
const superagent = require('superagent');
const startOfString = 'https://api.github.com/repos/';
client.connect();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));

app.get('/', initializeHomePage);
app.get('/', githubHit); //put data into input fields here
//app.post('', githubPostToBase); //take data out of input fields here and post to database. render accordingly 

function initializeHomePage(req,res){
  res.render('pages/main');
}

function throwError(response, err) {
  console.error(err);
  response.render('pages/sqlerror');
}

function githubHit(req,res){
// things that we can get from github api without an auth token: name of repo, url, open issues, issue name and link, date it's created, date of last push
  let endOfString = `${req.body.user}/${req.body.repo}`;
  let conString = startOfString + endOfString;
  superagent.get(conString)
      .then(data => {
      console.log(data.body.html_url);
      console.log(data.body.name);
      console.log(data.body.open_issues);
    })
  /* let issues = conString +'/issues/25';
  console.log(issues);
  superagent.get(issues)
    .then(datum => {
      console.log(datum.body.html_url);
      console.log(datum.body.state);
      console.log(datum.body.created_at);
      console.log(datum.body.updated_at);
    }) */
    // .catch(error => {
    //   console.error(error);
    // });
}

function githubPostToBase(req, res) {
  let endOfString = `${req.body.user}/${req.body.repo}`;
  let conString = startOfString + endOfString;
  superagent.get(conString)
    .then(data => {
      console.log('hello');
      let SQL = `INSERT INTO projects(name)
      VALUES ($1);
      `;
      let values = [data.body.name];
      console.log(data.body.name);
      client.query(SQL, values);
    });

}

app.use(express.static(__dirname + '/public'));
app.use('*', (req, res) => res.render('pages/error'));
app.listen(PORT, () => console.log(`server hath started on port ${PORT}`));

//database initialization

let sampleRequest = {
  body : {
    user : 'diego-ramos130',
    repo : 'pptt'
  }
}; 
//console.log(sampleRequest);

// githubHit(sampleRequest, 0);

githubPostToBase(sampleRequest, 0);