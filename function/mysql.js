const mysql = require('mysql2');

const CreatePool = async () => {
    const pool = mysql.createPool({
        host: process.env.mysqlhost,
        port: process.env.mysqlport ? Number(process.env.mysqlport) : 3306,
        user: process.env.mysqluser,
        password: process.env.mysqlpass,
        database: process.env.mysqldatabase,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 10000,
        acquireTimeout: 10000,
    });

    return pool
}

module.exports = {
    CreatePool
};