const express = require('express');
const app = express();

const http = require("http");
const server = http.createServer(app);
const port = process.env.PORT || '4000';
app.set('port', port);

const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const upload = multer();

app.use(express.static('public'));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


function mysqlCreateUserSimple(username, password) {
  let con = mysql.createConnection({
    host: "localhost",
    user: "user_auth_writer",
    password: "user_auth_writer",
    database: "user_auth"
  });

  con.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
    var sql = `INSERT IGNORE INTO users (username, hashed_password) VALUES ("${username}", "${password}")`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    });
  });
}


function mysqlCreateUser(username, password) {
  return new Promise((resolve, reject) => {
    let con = mysql.createConnection({
      host: "localhost",
      user: "user_auth_writer",
      password: "user_auth_writer",
      database: "user_auth"
    });

    con.connect((err) => {
      if (err) return reject(err);
      const sql = `INSERT IGNORE INTO users (username, hashed_password) VALUES (?, ?)`;
      con.query(sql, [username, password], (err, result) => {
        if (err) return reject(err);
        resolve(result)
      });
    });
  })
}

app.post("/users/login", (req, res) => {
  console.log(req.body)
  const username = req.body.username;
  const password = req.body.password;
  mysqlCreateUser(username, password)
})



app.post('/', async (req, res) => {
  console.log(req.body)
  try {
    const { username, password } = req.body;
    await mysqlCreateUser(username, password);
    res.status(200).send('User created');
  } catch (err) {
    res.status(500).send('Database error');
  }
});


app.post('/users/register', upload.none(), async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await mysqlCreateUser(username, password);
    res.status(200).send('User created');
  } catch (err) {
    res.status(500).send('Database error');
  }
});

server.listen(port, () => {
  console.log('listening on port: '+ port);
})


//select * From users
//Delete from users where id = 12