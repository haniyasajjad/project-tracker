const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'project_tracker',
    password: 'your_password', // Match the password you set, or remove if none
    port: 5432,
});

module.exports = pool;
