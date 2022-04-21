global.database = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

database.connect(err => {
    if (err) 
        throw err;
});

// To prevent the database timing out from idle, we'll just ping it every 10 minutes
setInterval(() => {
    database.query("SELECT 1");
}, 600000);