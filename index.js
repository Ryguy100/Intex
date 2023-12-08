// Provo Mental Health Survey Website
// by Alex Pesantez, Andrew Naumann, Caleb Reese, Ryan Hafen
// Section 001

// Project Description: This project is a website made for the city of provo to collect data through
// a survey about people's mental health. This data is fed into a database that is then used in a tableau dashboard
// so that users of the website can view connections between social media usage and the quality of mental health
// in provo and in plainsville.

// Import Middlewares, APIs, and Libraries

const express = require("express");
let app = express();
const session = require("express-session");
const OpenAI = require("openai");
let path = require("path");

// Pull the port from an environment variable (RDS)

const PORT = process.env.PORT || 5500;

// Grab environment variables so that they can be accessed here

require("dotenv").config();

// Because the app uses EJS, apply middleware some middleware

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("assets"));

// Import the OpenAI API to generate quotes that boost mental health from famous people.

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Set up databse connection to AWS and RDS and use .env variables

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

// configure express session

app.use(
  session({
    secret: "Cheese", // Replace with a strong, random string
    resave: false,
    saveUninitialized: false,
  })
);

// Design a middleware to check if a user is authenticated

const authenticateUser = (req, res, next) => {
  if (req.session && req.session.user) {
    // If the user is authenticated, pass the user data to the next middleware
    res.locals.user = req.session.user;
  } else {
    res.locals.user = undefined;
  }
  // Continue to the next middleware even if the user is not authenticated
  next();
};

app.use(authenticateUser);

// generate a timestamp

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

// On the "/" route, show a generated quote from chatgpt on the bottom of the home page.

let completion = "";

app.get("/", async (req, res) => {
  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content:
          "Share a positive quote that would benefit someone with poor mental health. Do not offer any other insight",
      },
    ],
  });

  completion = chatCompletion.choices[0].message.content;

  res.render("home", { user: res.locals.user, chat: completion });
});

// Survey Route

app.get("/survey", (req, res) => {
  res.render("survey", { user: res.locals.user });
});

// Get the results of the survey and feed them to the postgres database

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
  // Set location_id to 2 which is Provo
  let survey_origin = 2;
  let aPlatforms = [];
  let aOrgs = [];

  console.log(req.body.socialMediaPlatforms);
  if (req.body.socialMediaPlatforms) {
    aPlatforms = req.body.socialMediaPlatforms;
  }

  console.log(req.body.organizationAffiliations);
  if (req.body.organizationAffiliations) {
    aOrgs = req.body.organizationAffiliations;
  }

  await knex("responses").insert({
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
    location_id: survey_origin,
  });

  iLatestID = 0;

  // Get the response ID of the last person who filled out the survey

  await knex
    .select()
    .from("responses")
    .then((result) => {
      iLatestID = result[result.length - 1].response_id;
    });

  console.log(iLatestID);

  // Populate the social media responses and organization responses linking tables with the appropriate data.

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

// Once the user completes the survey, take them to the completed survey page and redirect them to the homepage
// This is to let the user know they have successfull submitted their survey and that they do not have to fill out again if they don't want to.

app.get("/CompletedSurvey", (req, res) => {
  res.render("CompletedSurvey", { user: res.locals.user });
});

// This route shows the tableau dashboard

app.get("/dashboard", (req, res) => {
  res.render("dashboard", { user: res.locals.user });
});

// When you try to log in, get a list of possible users from postgres (not very secure but this worked for us).

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

  res.render("login", { user: res.locals.user });
});

// When the user tries to login, they either pass through and go to the homepage or go back to the login page

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Simulate user data (replace this with your actual user authentication logic)
  const user = aUsers.find((u) => u.name == username && u.pass == password);

  if (user) {
    // Set user data in the session
    req.session.user = user;
    res.redirect("/");
  } else {
    // Handle authentication failure

    res.redirect("/login?error=Authentication Failed");
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

app.get("/data", async (req, res) => {
  try {
    const data = await knex.select("*").from("responses");
    res.render("data", { data: data, user: res.locals.user });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal Server Error");
  }
  // res.render("data", { user: res.locals.user });
});

app.post("/datum", async (req, res) => {
  let record_id = req.body.dropdown;
  let aOrgs = [
    "This response told us they were not affiliated with any organization.",
  ];
  let aPlatforms = ["This response told us they were not on social media."];

  let social_responses = await knex
    .select()
    .from("social_media_responses")
    .where("response_id", req.body.dropdown);

  if (social_responses) {
    aPlatforms = social_responses;
  }

  let result = await knex
    .select()
    .from("responses")
    .where("response_id", req.body.dropdown);

  let social_medias = await knex.select("*").from("social_media_info");

  let organization_responses = await knex
    .select()
    .from("organization_responses")
    .where("response_id", req.body.dropdown);

  if (organization_responses.length) {
    aOrgs = organization_responses;
  }

  let organizations = await knex.select().from("organization_info");

  res.render("datum", {
    data: result,
    sr: aPlatforms,
    user: res.locals.user,
    sm: social_medias,
    or: aOrgs,
    os: organizations,
  });
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

// Edit a user, could be your own account or the account of someone else if you are an administrator

app.get("/edit/:userid", (req, res) => {
  editedID = req.params.userid;

  knex
    .select()
    .from("users")
    .where("user_id", editedID)
    .then((result) => {
      res.render("editaccount", { user: result, admin: res.locals.user });
    });
});

// Submit edits to the database

app.post("/edit/:userid", async (req, res) => {
  let editedID = req.params.userid;
  let ownID = res.locals.user.id;

  let newUsername = req.body.username.toLowerCase();
  let newEmail = req.body.email.toLowerCase();
  let newPassword = req.body.password;
  let newisadmin = req.body.isadmin == "on";

  try {
    // Update the user information
    await knex("users").where("user_id", editedID).update({
      username: newUsername,
      email: newEmail,
      password: newPassword,
      is_admin: newisadmin,
    });

    // Fetch the updated user data after the update
    // const updatedUser = await knex("users").where("user_id", editedID).first();

    if (editedID == res.locals.user.id) {
      // If the edited user is the logged-in user, update the session
      req.session.user.name = newUsername;
    }

    // Some validation scripts to see who is the session user after someone edits their account.

    console.log("logged on as " + req.session.user.id);

    // Redirect only after the session is updated
    res.redirect("/");
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send("Internal Server Error");
  }
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

// This is a route to a test page where we could try out styling and functionality of modules

app.get("/test", (req, res) => {
  res.render("test", { user: res.locals.user });
});

// Tell the server to start listening!

app.listen(PORT, () => console.log("Application has started"));
