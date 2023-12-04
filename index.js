const express = require("express");
let app = express();
let path = require("path");

const PORT = process.env.PORT || 5500;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/"));

const knex = require("./config/database.js");

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/survey", (req, res) => {
  res.render("survey");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.listen(PORT, () => console.log("Application has started"));
