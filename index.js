const express = require("express");
let app = express();
let path = require("path");

const PORT = process.env.PORT || 5500;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/"));

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

let isAdmin = false;
let currentUsername = "";

app.get("/", (req, res) => {
  res.render("home", { user: currentUsername });
});

app.get("/survey", (req, res) => {
  res.render("survey");
});

let aUsers = [];

function isUserInArray(u, p, array) {
  for (let i = 0; i < array.length; i++) {
    if (array[i].name == u && array[i].pass == p) {
      currentUsername = u;
      isAdmin = array[i].is_admin;
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
        aUsers.push({
          name: result[i].username,
          pass: result[i].password,
          isadmin: result[i].is_admin,
        });
      }
    });
  console.log(aUsers);
  res.render("login");
});

app.post("/login", (req, res) => {
  if (isUserInArray(req.body.username, req.body.password, aUsers) == true) {
    res.redirect("/", { user: currentUsername });
    console.log("Success. Welcome " + currentUsername);
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

app.get("/seedata", (req, res) => {
  res.render("seedata");
});

app.get("/signout", (req, res) => {
  res.render("/signout");
});

app.listen(PORT, () => console.log("Application has started"));
