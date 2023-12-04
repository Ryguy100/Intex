require("knex")({
  client: "pg",
  connection: {
    host: "localhost",
    user: "postgres",
    password: YOUR_PASSWORD,
    database: YOUR_DATABASE,
    port: 5432,
  },
});