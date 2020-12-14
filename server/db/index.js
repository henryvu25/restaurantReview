const { Pool } = require("pg");

const pool = new Pool(); //no need for variables, Pool can get the db info from .env automatically

module.exports = {
    query: (text, params) => pool.query(text,params),
}