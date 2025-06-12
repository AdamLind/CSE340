const pool = require("../database");

/* *****************************
 *   Register new account
 * *************************** */
async function registerAccount(
  account_firstname,
  account_lastname,
  account_email,
  account_password
) {
  try {
    const sql =
      "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    return await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    ]);
  } catch (error) {
    return error.message;
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const email = await pool.query(sql, [account_email]);
    return email.rows.length > 0 ? email.rows[0].account_email : null;
  } catch (error) {
    return error.message;
  }
}

/* *****************************
 * Return account data using email address
 * ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1",
      [account_email]
    );
    return result.rows[0];
  } catch (error) {
    return new Error("No matching email found");
  }
}

async function updateAccount(
  accountId,
  account_firstname,
  account_lastname,
  account_email,
  account_type = "Client" // Default to 'Client' if not provided
) {
  try {
    const sql =
      "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3, account_type = $4 WHERE account_id = $5 RETURNING *";
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_type,
      accountId,
    ]);
    return result;
  } catch (error) {
    return error.message;
  }
}

async function updateAccountPassword(accountId, account_password) {
  try {
    const sql =
      "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *";
    const result = await pool.query(sql, [account_password, accountId]);
    return result;
  } catch (error) {
    return error.message;
  }
}

async function getAccountById(accountId) {
  try {
    const sql = "SELECT * FROM account WHERE account_id = $1";
    const result = await pool.query(sql, [accountId]);
    return result.rows[0];
  } catch (error) {
    console.error("Error fetching account by ID:", error);
    throw new Error("Database error while fetching account");
  }
}

async function getAllAccounts() {
  try {
    const sql = "SELECT * FROM account";
    const result = await pool.query(sql);
    return result.rows;
  } catch (error) {
    console.error("Error fetching all accounts:", error);
    throw new Error("Database error while fetching accounts");
  }
}

async function deleteAccount(accountId) {
  try {
    const sql = "DELETE FROM account WHERE account_id = $1";
    const result = await pool.query(sql, [accountId]);
    return result.rowCount > 0; // Returns true if a row was deleted
  } catch (error) {
    console.error("Error deleting account:", error);
    throw new Error("Database error while deleting account");
  }
}

module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  updateAccount,
  updateAccountPassword,
  getAccountById,
  getAllAccounts,
  deleteAccount,
};
