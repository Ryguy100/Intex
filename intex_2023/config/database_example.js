require("knex")({
    client: "pg",
    connection: {
        host : "localhost",
        user : "postgres",
        password : YOUR_USERNAME,
        database : YOUR_DATABASE_NAME,
        port : 5432
    }
});