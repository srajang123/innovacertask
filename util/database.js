const mysql = require('mysql2');
const pool = mysql.createPool({ host: 'sql12.freemysqlhosting.net', user: 'sql12313687', password: 'VuFaNpXUYF', database: 'sql12313687' });
module.exports = pool.promise();