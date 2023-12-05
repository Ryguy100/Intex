const express = require("express");
let app = express();
const session = require("express-session");
let path = require("path");

const PORT = process.env.PORT || 5500;

require("dotenv").config();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("assets"));

const knex = require("knex")({
  client: "pg",
  connection: {
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DB_NAME,
    port: process.env.RDS_PORT,
    ssl: process.env.DB_SSL ? {rejectUnauthorized : false} : false
  },
});

app.use(
  session({
    secret: "Jewish66", // Replace with a strong, random string
    resave: false,
    saveUninitialized: true,
  })
);

// let isAdmin = false;
// let currentUsername = "";

const authenticateUser = (req, res, next) => {
  if (req.session && req.session.user) {
    // If the user is authenticated, pass the user data to the next middleware
    res.locals.user = req.session.user;
  }
  // Continue to the next middleware even if the user is not authenticated
  next();
};

app.use(authenticateUser);

app.get("/", (req, res) => {
  res.render("home", { user: res.locals.user });
});

app.get("/survey", (req, res) => {
  res.render("survey", { user: res.locals.user });
});

app.get("/dashboard", (req, res) => {
  res.render("dashboard", { user: res.locals.user });
});

let aUsers = [];

app.get("/login", async (req, res) => {
  await knex
    .select()
    .from("users")
    .then((result) => {
      aUsers = [];
      for (let i = 0; i < result.length; i++) {
        aUsers.push({
          name: result[i].username,
          pass: result[i].password,
          isadmin: result[i].is_admin,
        });
      }
    });

  console.log(aUsers.length);
  console.log(aUsers);
  res.render("login");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Simulate user data (replace this with your actual user authentication logic)
  const user = aUsers.find((u) => u.name == username && u.pass == password);

  if (user) {
    // Set user data in the session
    req.session.user = user;
    res.redirect("/");
  } else {
    // Handle authentication failure
    res.status(401).send("Authentication failed");
    // Alternatively, you can redirect to a login page with an error message
    // res.redirect('/login?error=Authentication failed');
  }
});

app.get("/register", (req, res) => {
  req.session.user = res.render("register");
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

app.get("/data", (req, res) => {
  res.render("data", { user: res.locals.user });
});

app.get("/logout", (req, res) => {
  // Clear user data from the session
  req.session.user = undefined;
  res.redirect("/");
});

app.listen(PORT, () => console.log("Application has started"));
