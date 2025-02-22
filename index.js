const express = require('express');
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'mysql_server', // docker-compose에서 정의한 서비스 이름
  user: 'thanhlam', // MYSQL_USER와 일치
  password: 'secret', // MYSQL_PASSWORD와 일치
  database: 'test_db', // MYSQL_DATABASE와 일치
});

let con = null;

const app = express();

// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
  res.send('hello world');
});

app.get('/connect', function (req, res) {
  con = connection;
  con.connect(function (err) {
    if (err) throw err;
    res.send('connected');
  });
});

app.get('/fetch', function (req, res) {
  con.connect(function (err) {
    if (err) throw err;
    const sql = `SELECT * FROM mytable`;
    con.query(sql, function (err, result, fields) {
      if (err) throw err;
      res.send(JSON.stringify(result));
    });
  });
});

app.listen(3000);

console.log('listening on port 3000');
