
'use strict';
require('dotenv').config();
const $ = require('jquery');
const pg = require('pg');
const express = require('express');
const PORT = process.env.PORT;
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);
const superagent = require('superagent');
const startOfString = 'https://api.github.com/repos/';
client.connect();

// Additional requirements for utilizing node-html-pdf
const fs = require('fs');
const pdf = require('html-pdf');
var options = {
  format : 'Letter',
  base : 'http://p2t2.herokuapp.com/' };
const ejs = require('ejs');
// End of additional requirements for node-html-pdf

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.post('/form/complete', githubPostToBase);
app.get('/form', initializeFormPage);
app.get('/dashboard/:id', initializeDashboardPage);
app.post('/dashboard/:id', testBump);
app.get('/about', initializeAboutPage);
app.get('/', initializeHomePage);
app.get('/', githubHit); //put data into input fields here
//app.post('', githubPostToBase); //take data out of input fields here and post to database. render accordingly

function initializeHomePage(req,res){
  let SQL = `SELECT id, collaborators, name, description FROM projects;`;
  client.query(SQL)
    .then(result => {
      let cardbase = result.rows;
      res.render('pages/main', {cardbase});
    });
}

function initializeFormPage(req, res) {
  res.render('pages/form');
}

function testBump(req,res){
  let SQL = 'INSERT INTO events(project_id,title,startdate,enddate,description) VALUES($1,$2,$3,$4,$5);';
  let values = [req.body.project_id, req.body.name, req.body.startdate, req.body.enddate,req.body.descript];
  client.query(SQL, values)
    .then(() => {
      let SQL = 'SELECT * FROM events WHERE project_id=$1;';
      values = [req.body.project_id];
      client.query(SQL,values)
        .then(result =>{
          let eventsFromServer = result.rows;
          res.render('pages/dashboard', eventsFromServer);
        });
    });
}
/* function test(req,res){
  .then(result => {
    console.log(result.rows);
    let parsed = result.rows;
    res.render('pages/dashboard', {parsed});
  })
} */
function initializeDashboardPage(req, res) {
  let SQL = `SELECT name, repo_url FROM projects
  WHERE id=$1;`;
  let values = [req.params.id];
  let SQLcal= 'SELECT * FROM events WHERE project_id=$1;';
  Promise.all([
    client.query(SQL, values),
    client.query(SQLcal, values),
  ]) .then(([projectsData, eventsData]) => {
    let project = projectsData.rows[0];
    let eventList = eventsData.fields;
    let splitHubUser = project.repo_url.split('/')[3];
    let splitHubRepo = project.repo_url.split('/')[4];
    let conString = `${startOfString}${splitHubUser}/${splitHubRepo}`;
    Promise.all([
      superagent.get(`${conString}/issues`),
      superagent.get(`${conString}/commits`),
      console.log('made it in after commits')
    ]).then(([issues, commits]) => {
      console.log('got out of the second promise');
      let latestIssue = issues.body.slice(0,5);
      let latestCommit = commits.body.slice(0,5);
      res.render('pages/dashboard', { latestIssue, latestCommit, eventList});
    });
  });
}

/*  .then (result => {
      Promise.all([
        superagent.get(`${conString}/issues`),
        superagent.get(`${conString}/commits`)
      ]).then(([issues, commits]) => {
        let latestIssue = issues.body.slice(0, 4);
        let latestCommit = commits.body.slice(0, 4);
        res.render('pages/dashboard', {latestIssue, latestCommit});
      });
    });
  // .catch(throwError(res)); */

function initializeAboutPage(req, res) {
  res.render('pages/about');
}


//How To Hit The API: A guide by Diego Ramos
/* 1. hit postman for the call you're gonna emulate and look at the object. Everything hinges on what you get from superagent's get, and the postman call emulates that.
   2. grab relevant github repo with an SQL query if you need it. throw it into superagent with any extra parts appended onto the string.
   3. put the information you need from the superagent get into a variable. map/reduce/filter/slice what elements you need out of it, and put all the necessary stuff in there.
   4. pass it to be rendered in your response.render statement as an object, ie {data}. */
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
    });
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
/*   let githubLink = req.body.github_repo;
  let splitHubUser = githubLink.split('/')[3];
  let splitHubRepo = githubLink.split('/')[4]; */
  /*  let conString = `${startOfString}${splitHubUser}/${splitHubRepo}`;
  console.log(conString); */
  /* superagent.get(conString)
    .then(data => { */
  let SQL = `INSERT INTO projects(collaborators ,name, startdate, enddate, repo_url, description)
  VALUES ($1, $2, $3, $4, $5, $6);`;
  let values = [
    req.body.collaborators,
    req.body.project_name,
    req.body.start_date,
    req.body.due_date,
    req.body.github_repo,
    req.body.description];
  client.query(SQL, values);
  res.render('pages/success');
/* }); */
}

app.use(express.static(__dirname + '/public'));
app.use('*', (req, res) => res.render('pages/error'));
app.listen(PORT, () => console.log(`server hath started on port ${PORT}`));

//database initialization

/* let sampleRequest = {
  body : {
    user : 'diego-ramos130',
    repo : 'pptt'
  }
};  */
//console.log(sampleRequest);

// githubHit(sampleRequest, 0);

//githubPostToBase(sampleRequest, 0);


// Create a PDF file function
function makePDF(req, res) {
  let SQL = `SELECT name, repo_url FROM projects
              WHERE id=1;`;
  client.query(SQL)
    .then (result => {
      let project = result.rows[0];
      let splitHubUser = project.repo_url.split('/')[3];
      let splitHubRepo = project.repo_url.split('/')[4];
      let conString = `${startOfString}${splitHubUser}/${splitHubRepo}/issues`;
      superagent.get(conString)
        .then(data => {
          let latestIssue = data.body.slice(0, 4);
          let html;
          ejs.renderFile('./views/pages/dashboard.ejs', {latestIssue}, function(err, res) {
            if(res) {
              html = res;
              console.log(html);
            }
            else {
              console.log(err);
            }
          });
          pdf.create(html, options).toFile(function(err, res) {
            if (err) return console.log(err);
            console.log(res);
          });
        });
    });
}

