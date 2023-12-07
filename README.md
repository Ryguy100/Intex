# Intex

## Welcome to our Website Code!

**Created by:**
- Ryan Hafen
- Andrew Naumann
- Caleb Reese
- Alexandra Pesantez

**Section:** 001

**URL:** [provo-mental-health.ryanhafen.org](https://provo-mental-health.ryanhafen.org)

**Deployment:**
Deployed using AWS Elastic Beanstalk and Amazon CodePipeline.

## Grading for Tech-Team

**Navigation:**
- Home page
- Survey page
- Dashboard page
- Login associated pages

**Dashboard:**
The Dashboard page features a connected Tableau dashboard with data linked to the RDS PostgreSQL database.

**Gathering Social Media Data:**
Data is collected on the Survey page through a form and posted to the "/survey" route. The default location is set to 2 (Provo) in the index.js file.

**Report:**
To access the report (admin only):
- Navigate to Data >> View all data from the database
- Table data is fetched from the RDS PostgreSQL database.
- Search functionality available for filtering by a specific person.

**Login Functionality:**
- To create a user: Go to login >> Register >> Enter account information
- To log in: Go to login >> Login >> Enter your account credentials
- To make a user admin (if already admin): Go to login >> Login >> Enter account credentials >> My Account >> Edit Users >> Toggle admin status
  - **Important:** Only admins can make other admins. Default admin credentials:
    - Username: admin
    - Password: password
- To edit account information: When logged in >> My Account >> Edit Account >> Modify information as needed
