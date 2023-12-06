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
    ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : false,
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

function generateTimestamp() {
  const currentDate = new Date();

  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
  const day = currentDate.getDate().toString().padStart(2, "0");

  const hours = currentDate.getHours().toString().padStart(2, "0");
  const minutes = currentDate.getMinutes().toString().padStart(2, "0");
  const seconds = currentDate.getSeconds().toString().padStart(2, "0");

  const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  return timestamp;
}

app.use(authenticateUser);

app.get("/", (req, res) => {
  res.render("home", { user: res.locals.user });
});

app.get("/survey", (req, res) => {
  res.render("survey", { user: res.locals.user });
});

app.post("/survey", async (req, res) => {
  let survey_time_stamp = generateTimestamp();
  let survey_age = req.body.age;
  let survey_gender = req.body.gender;
  let survey_relationship = req.body.relationshipStatus;
  let survey_occupation = req.body.occupationStatus;
  let survey_time_spent = req.body.averageTimeOnSocialMedia;
  let survey_non_purpose = req.body.purposelessSocialMedia;
  let survey_frequency = req.body.distractedBySocialMedia;
  let survey_restlessness = req.body.restlessWithoutSocialMedia;
  let survey_easily = req.body.easilyDistracted;
  let survey_bothered = req.body.botheredByWorries;
  let survey_difficult = req.body.difficultToConcentrate;
  let survey_comparison = req.body.compareToOthersOnSocialMedia;
  let survey_feelings = req.body.feelingsAboutSocialMediaComparisons;
  let survey_validation = req.body.seekValidationOnSocialMedia;
  let survey_depressed = req.body.feelDepressedOrDown;
  let survey_interest = req.body.interestFluctuation;
  let survey_issues = req.body.sleepIssues;
  let survey_origin = "Provo";

  console.log(req.body.socialMediaPlatforms);
  aPlatforms = req.body.socialMediaPlatforms;

  console.log(req.body.organizationAffiliations);
  aOrgs = req.body.organizationAffiliations;

  await knex("responses")
    .insert({
      time_stamp: survey_time_stamp,
      age: survey_age,
      gender: survey_gender,
      relationship_status: survey_relationship,
      occupational_status: survey_occupation,
      time_spent: survey_time_spent,
      non_purposeful_social_media_usage: survey_non_purpose,
      frequency_of_social_media_distractions: survey_frequency,
      restlessness_due_to_social_media: survey_restlessness,
      easily_distracted: survey_easily,
      bothered_by_worries: survey_bothered,
      difficult_to_concentrate: survey_difficult,
      comparison_to_successful_people: survey_comparison,
      feel_about_comparisons: survey_feelings,
      seek_validation: survey_validation,
      depressed_or_down: survey_depressed,
      interest_in_daily_activities_fluctuate: survey_interest,
      issues_with_sleep: survey_issues,
      origin: survey_origin,
    })
    .then((results) => {
      res.redirect("/");
    });

  iLatestID = 0;

  await knex
    .select()
    .from("responses")
    .then((result) => {
      iLatestID = result[result.length - 1].response_id;
    });

  console.log(iLatestID);

  if (aPlatforms.length > 0) {
    for (let i = 0; i < aPlatforms.length; i++) {
      await knex("social_media_responses").insert({
        social_media_id: aPlatforms[i],
        uses_platform: "Yes",
        response_id: iLatestID,
      });
    }
  } else {
    await knex("social_media_responses").insert({
      social_media_id: 0,
      uses_platform: "No",
      response_id: iLatestID,
    });
  }

  if (aOrgs.length > 0) {
    for (let i = 0; i < aOrgs.length; i++) {
      await knex("organization_responses").insert({
        response_id: iLatestID,
        organization_id: aOrgs[i],
      });
    }
  } else {
    await knex("organization_responses").insert({
      response_id: iLatestID,
      organization_id: 0,
    });
  }
  res.redirect("/CompletedSurvey");
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
          id: result[i].user_id,
          name: result[i].username,
          email: result[i].email,
          pass: result[i].password,
          isadmin: result[i].is_admin,
        });
      }
    });

  console.log(aUsers);
  res.render("login", { user: res.locals.user });
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
  req.session.user = res.render("register", { user: res.locals.user });
});

app.post("/register", (req, res) => {
  let username = req.body.username.toLowerCase();
  let email = req.body.email.toLowerCase();
  let password = req.body.password;

  knex("users")
    .insert({
      username: username,
      email: email,
      password: password,
      is_admin: false,
    })
    .then((results) => {
      res.redirect("/login");
    });
});

app.get("/data", (req, res) => {
  res.render("data", { user: res.locals.user });
});

app.get("/users", (req, res) => {
  knex
    .select()
    .from("users")
    .then((result) => {
      res.render("users", { user: res.locals.user, users: result });
    });
});

app.get("/logout", (req, res) => {
  // Clear user data from the session
  req.session.user = undefined;
  res.render("logout", { user: res.locals.user });
});

// Edit a user

app.get("/edit/:userid", (req, res) => {
  knex
    .select()
    .from("users")
    .where("user_id", req.params.userid)
    .then((result) => {
      console.log(result);
      res.render("editaccount", { user: result, admin: res.locals.user });
    });
});

app.post("/edit/:userid", async (req, res) => {
  await knex("users").where("user_id", req.params.userid).update({
    username: req.body.username.toLowerCase(),
    email: req.body.email.toLowerCase(),
    password: req.body.password,
    is_admin: req.body.isadmin,
  });

  if (req.params.userid == res.locals.user.id) {
    let updatedUser = await knex("users")
      .where({ user_id: req.params.userid })
      .first();

    req.session.user = updatedUser;
    req.session.user.name = updatedUser.username;
  }

  res.redirect("/");
});

// Delete a user

app.get("/delete/:userid", (req, res) => {
  let deleteMessage = { Message: "Deleted" };
  knex("users")
    .where("user_id", req.params.userid)
    .del()
    .then((result) => {
      res.redirect("/users");
    });
});

app.get("/test", (req, res) => {
  res.render("test", { user: res.locals.user });
});

app.listen(PORT, () => console.log("Application has started"));
