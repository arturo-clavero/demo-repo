'use strict'

// Database settings come from the environment only (vars.env locally, the
// orchestrator's secrets in production). Nothing here has a default password.
module.exports = {
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  host: process.env.MYSQL_HOST || 'mysql-db',
  port: Number(process.env.MYSQL_PORT || 3306),
  dialect: 'mysql',
  logging: false,
  pool: { max: 10, min: 0, idle: 10000 }
}
