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

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/survey", (req, res) => {
  res.render("survey");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  let aUsers = [];
  knex
    .select()
    .from("users")
    .then((result) => {
      for (let i = 0; i < result.length; i++) {
        aUsers.push({ name: result[i].username, pass: result[i].password });
      }
    });

  function isUserInArray(username, password, array) {
    for (let i = 0; i < array.length; i++) {
      if (array[i].name === username && array[i].pass === password) {
        return true; // User found in the array
      }
    }
    return false; // User not found in the array
  }

  if (isUserInArray(req.body.username, req.body.password, aUsers)) {
    res.redirect("home", () => {
      console.log(`Logged in as ${req.body.username}`);
      alert("login success");
    });
  } else {
    res.redirect("home", () => {
      console.log("Failed to authenticate");
      alert("login failure");
    });
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
      res.redirect("login");
    });
});

app.listen(PORT, () => console.log("Application has started"));
