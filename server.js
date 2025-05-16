var express = require('express');
var app = express();
var mysql = require('mysql2');
const http = require("http");
const server = http.createServer(app);
const port = process.env.PORT || '4000';
app.set('port', port);

app.use(express.static('public'));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/plain');
  next();
});

app.use(express.urlencoded({ extended: true }));


app.post("/", (req, res) => {
  console.log(req.body)
  const username = req.body.username;
  const password = req.body.password;
  console.log(username)
  let con = mysql.createConnection({
    host: "localhost",
    user: "user_auth_writer",
    password: "user_auth_writer",
    database: "user_auth"
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = `INSERT IGNORE INTO users (username, hashed_password) VALUES ("${username}", "${password}")`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
      //res.status(200).json({ redirectUrl: "/"});
      res.redirect('/')
    });

  });

  //res.status(200).send('Data received!');

})

app.use(express.json());

app.post('/user_auth', (req, res) => {



  const username = req.body.username;
  const password = req.body.password;
  console.log(username)

  
  let con = mysql.createConnection({
    host: "localhost",
    user: "user_auth_writer",
    password: "user_auth_writer",
    database: "user_auth"
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = `INSERT IGNORE INTO users (username, hashed_password) VALUES ("${username}", "${password}")`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
      //res.status(200).json({ redirectUrl: "/"});
      res.redirect('/')
    });

  });

  //res.status(200).send('Data received!');
});


server.listen(port, () => {
  console.log('listening on port: '+ port);
})


//select * From users
//Delete from users where id = 12