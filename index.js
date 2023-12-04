const express = require("express");
let app = express();
let path = require("path");

const PORT = process.env.PORT || 5500;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("assets"));


const knex = require("knex")({
  client: "pg",
  connection: {
    host: "localhost",
    user: "postgres",
    password: "Jewish66",
    database: "intex",
    port: 5432,
  },
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/survey", (req, res) => {
  res.render("survey");
});

let aUsers = [];

function isUserInArray(u, p, array) {
  for (let i = 0; i < array.length; i++) {
    if (array[i].name == u && array[i].pass == p) {
      return true; // User found in the array
    }
  }
  return false; // User not found in the array
}

app.get("/login", async (req, res) => {
  await knex
    .select()
    .from("users")
    .then((result) => {
      for (let i = 0; i < result.length; i++) {
        aUsers = [];
        aUsers.push({ name: result[i].username, pass: result[i].password });
      }
    });
  console.log(aUsers);
  res.render("login");
});

app.post("/login", (req, res) => {
  if (isUserInArray(req.body.username, req.body.password, aUsers) == true) {
    res.redirect("/");
    console.log("Success");
  } else {
    res.redirect("/");
    console.log("Failed");
  }
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;

  knex("users")
    .insert({
      username: username,
      email: email,
      password: password,
      is_admin: false,
    })
    .then((results) => {
      res.redirect("/");
    });
});

app.listen(PORT, () => console.log("Application has started"));
