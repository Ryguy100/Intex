require("knex")({
  client: "pg",
  connection: {
    host: "localhost",
    user: "postgres",
    password: "yours",
    database: "yours",
    port: 5432,
  },
});
