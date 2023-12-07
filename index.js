const express = require("express");
let app = express();
const session = require("express-session");
const OpenAI = require("openai");
let path = require("path");

const PORT = process.env.PORT || 5500;

require("dotenv").config();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("assets"));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    secret: "Cheese", // Replace with a strong, random string
    resave: false,
    saveUninitialized: false,
  })
);

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

let completion = "";

app.get("/", async (req, res) => {
  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: "Share a short motivational quote and who said it",
      },
    ],
  });

  completion = chatCompletion.choices[0].message.content;

  res.render("home", { user: res.locals.user, chat: completion });
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
  let survey_origin = 2;
  let aPlatforms = [];
  let aOrgs = [];

  console.log(req.body.socialMediaPlatforms);
  if (req.body.socialMediaPlatforms.length > 0) {
    aPlatforms = req.body.socialMediaPlatforms;
  }

  console.log(req.body.organizationAffiliations);
  if (req.body.organizationAffiliations.length > 0) {
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

app.get("/CompletedSurvey", (req, res) => {
  res.render("CompletedSurvey", { user: res.locals.user });
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

  res.render("login", { user: res.locals.user });
});

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
  editedID = req.params.userid;

  knex
    .select()
    .from("users")
    .where("user_id", editedID)
    .then((result) => {
      res.render("editaccount", { user: result, admin: res.locals.user });
    });
});

app.post("/edit/:userid", async (req, res) => {
  let editedID = req.params.userid;
  let ownID = res.locals.user.id;

  let newUsername = req.body.username.toLowerCase();
  let newEmail = req.body.email.toLowerCase();
  let newPassword = req.body.password;
  let newisadmin = req.body.isadmin === true;

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

    // console.log(updatedUser);

    if (editedID == res.locals.user.id) {
      // If the edited user is the logged-in user, update the session
      req.session.user.name = newUsername;
    }

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

app.get("/test", (req, res) => {
  res.render("test", { user: res.locals.user });
});

app.listen(PORT, () => console.log("Application has started"));
