const express = require("express");
let app = express();
let path = require("path");

const PORT = 5500;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/"));

// const knex = require("knex")({
//     client: "pg",
//     connection: {
//         host : "localhost",
//         user : "postgres",
//         password : "ryanhafen",
//         database : "practice_nodeJS",
//         port : 5432
//     }
// });

app.get("/", (req, res) => {
  res.render("home");
});

app.listen(PORT, () => console.log("Application has started"));
