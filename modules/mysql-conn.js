// const mysql = require('mysql2'); // normal version: mysql2/index.js
const mysql = require('mysql2/promise'); // promise version: mysql2/promise.js
let pool = mysql.createPool({
    host: '192.168.0.57',
    user: 'ruser',
    password: '0000',
    port: 3306,
    database: 'spl_proj',
    connectionLimit: 10
});

async function sqlAction(pool, sql, sqlVals) {
    const connect = await pool.getConnection();
    const result = await connect.query(sql, sqlVals);
    connect.release(); // release pool
    return result;
}

module.exports = { pool, sqlAction };