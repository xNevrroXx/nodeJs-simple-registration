// third-party modules
const express = require("express");
const dotenv = require("dotenv");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
// own modules
const routes = require("./routes/routes");

dotenv.config();

const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE
const DB_PORT = process.env.DB_PORT

const db = mysql.createPool({
  connectionLimit: 100,
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  port: DB_PORT
})

db.getConnection((error, connection) => {
  if(error) {
    throw new Error(error);
  }

  console.log("DB connected successful: " + connection.threadId);
})

const app = express();
const port = process.env.PORT;

app.use(express.json());

routes(app, db);

app.listen(port, () => {
  console.log(`Server Started on port ${port}...`);
})