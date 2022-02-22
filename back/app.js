const express = require('express');
const helmet = require("helmet");
const app = express();
const cors = require('cors');

//const path = require('path');

require('dotenv').config();




//Headers CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});


app.use(helmet());
app.use(express.json({limit: '50mb', extended: true}));
app.use(express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

//connexion DB

const mysql      = require('mysql');
const connection = mysql.createConnection({
  host     :  process.env.DATABASE_HOST,
  user     : process.env.DATABASE_USER,
  password :process.env.DATABASE_PASSWORD,
  database :process.env.DATABASE_NAME
});
 
connection.connect()
 
connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
});
 
connection.end();



app.use(cors());
//app.use('/api/users', userRoutes);
//app.use('/api/auth', userRoutes);

module.exports = app;