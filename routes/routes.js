const bcrypt = require("bcrypt");
const mysql = require("mysql");
const generateAccessToken = require("../modules/generateAccessToken");

function routes(app, db) {
  app.post("/createuser", async (request, response) => {
    console.log(request.body);
    const name = request.body.name;
    const hashedPassword = await bcrypt.hash(request.body.password, 10);

    console.log("name: ", name);
    console.log("password: ", request.body.password);
    console.log("hashedPassword: ", hashedPassword);

    db.getConnection(async (error, connection) => {
      if(error) {
        throw new Error(error);
      }

      const sqlSearch = "SELECT * FROM user WHERE name = ?";
      const searchQuery = mysql.format(sqlSearch, [name]);

      const sqlInsert = "INSERT INTO user VALUES (0, ?, ?)";
      const insertQuery = mysql.format(sqlInsert, [name, hashedPassword]);

      await connection.query(searchQuery, async(error, result) => {
        if(error) {
          throw new Error(error);
        }

        console.log("------> Search Results")
        console.log(result.length);

        if (result.length !== 0) {
          connection.release();
          console.log("------> User already exists");
          response.sendStatus(409);
        }
        else {
          connection.query(insertQuery, (error, result) => {
            connection.release();

            if (error) {
              throw new Error(error);
            }

            console.log("------> Create new User")
            console.log(result.insertId);
            response.sendStatus(201);
          });
        }
      })
    })
  })

  app.post("/login", (request, response) => {
    const name = request.body.name;
    const password = request.body.password;

    db.getConnection(async (error, connection) => {
      if (error) {
        throw new Error(error);
      }

      const sqlSearch = "SELECT * FROM user WHERE name = ?";
      const sqlQuery = mysql.format(sqlSearch, [name]);

      await connection.query(sqlQuery, async (error, result) => {
        connection.release();
        if (error) {
          throw new Error(error);
        }

        if (result.length === 0) {
          console.log("------> User does not exist");
          response.sendStatus(404);
        } else {
          if (await bcrypt.compare(password, result[0].password)) {
            console.log("------> Login Successful");
            console.log("------> Generate Access Token");
            const token = generateAccessToken({name: name});
            console.log(token);
            response.json({accessToken: token});
          }
          else {
            console.log("------> Password is incorrect");
            response.send("Password Incorrect");
          }
        }
      })
    })
  })
}

module.exports = routes;