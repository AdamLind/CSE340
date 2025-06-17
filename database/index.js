const { Pool } = require("pg");
require("dotenv").config();

const isDev = process.env.NODE_ENV === "development";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Accept self-signed cert (works for Render)
  },
});

if (isDev) {
  // Extra logging for development
  module.exports = {
    async query(text, params) {
      try {
        const res = await pool.query(text, params);
        console.log("executed query", { text });
        return res;
      } catch (error) {
        console.error("error in query", { text });
        throw error;
      }
    },
  };
} else {
  // Production: export raw pool
  module.exports = pool;
}
