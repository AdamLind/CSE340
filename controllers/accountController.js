const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Deliver Account view
 * *************************************** */
async function buildAccount(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/index", {
    title: "Account",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congrats, ${account_firstname}! You\'re all set. Please log in.`
    );
    res.redirect("/account/login");
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    });
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      return res.redirect("/account/");
    } else {
      console.log("Password mismatch, redirecting to login...");
      req.flash("notice", "Please check your credentials and try again.");
      res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    console.log("Error during login:", error);
    throw new Error("Access Forbidden");
  }
}

async function buildUpdate(req, res) {
  let nav = await utilities.getNav();
  const accountId = parseInt(req.params.account_id);
  const userData = res.locals.accountData;
  const accountData = await accountModel.getAccountById(accountId);

  if (!accountData) {
    req.flash("notice", "Account not found.");
    return res.redirect("/account/");
  }

  res.render("account/update", {
    title: "Update Account",
    nav,
    userData,
    accountData,
    errors: null,
  });
}

async function updateAccount(req, res) {
  const accountId = parseInt(req.params.account_id);
  const { account_firstname, account_lastname, account_email, account_type } =
    req.body;
  const userData = res.locals.accountData;

  if (
    !userData ||
    (userData.account_id !== accountId && userData.account_type !== "Admin")
  ) {
    console.log(
      "Unauthorized update attempt by account ID:",
      userData.account_id
    );
    req.flash("notice", "You are not authorized to update this account.");
    return res.redirect("/account/update/" + accountId);
  }

  try {
    const updateResult = await accountModel.updateAccount(
      accountId,
      account_firstname,
      account_lastname,
      account_email,
      account_type
    );

    if (updateResult && userData.account_id === accountId) {
      const updatedAccount = await accountModel.getAccountById(accountId);
      const token = jwt.sign(updatedAccount, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: 3600 * 1000,
      });
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 3600 * 1000,
      });
      req.flash("notice", "Account successfully updated.");
      return res.redirect("/account/");
    } else if (updateResult && userData.account_type === "Admin") {
      req.flash("notice", "Account successfully updated.");
      return res.redirect("/account/manage-accounts");
    } else {
      throw new Error("Update failed");
    }
  } catch (error) {
    console.error("Error updating account:", error);
    req.flash("notice", "Error updating account. Please try again.");
    return res.redirect(`/account/update/${accountId}`);
  }
}

async function changePassword(req, res) {
  const accountId = parseInt(req.params.account_id);
  const { current_password, new_password } = req.body;

  const jwtData = res.locals.accountData;

  if (!jwtData || jwtData.account_id !== accountId) {
    req.flash("notice", "You are not authorized to change this password.");
    return res.redirect("/account/update/" + accountId);
  }

  try {
    const accountFromDB = await accountModel.getAccountById(accountId);
    const isMatch = await bcrypt.compare(
      current_password,
      accountFromDB.account_password
    );

    if (!isMatch) {
      req.flash("notice", "Current password is incorrect.");
      return res.redirect(`/account/update/${accountId}`);
    }

    const hashedNewPassword = bcrypt.hashSync(new_password, 10);
    await accountModel.updateAccountPassword(accountId, hashedNewPassword);

    const updatedAccount = await accountModel.getAccountById(accountId);
    const token = jwt.sign(updatedAccount, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("jwt", token, { httpOnly: true });

    req.flash("notice", "Password successfully changed.");
    return res.redirect("/account/");
  } catch (error) {
    console.error("Error changing password:", error);
    req.flash("notice", "Error changing password. Please try again.");
    return res.redirect(`/account/update/${accountId}`);
  }
}

async function buildManageAccounts(req, res) {
  let nav = await utilities.getNav();
  const accounts = await accountModel.getAllAccounts();

  const order = {
    Admin: 0,
    Employee: 1,
    Client: 2,
  };

  const sortedAccounts = accounts.sort((a, b) => order[a.account_type] - order[b.account_type]);

  if (!sortedAccounts || sortedAccounts.length === 0) {
    req.flash("notice", "No accounts found.");
    return res.redirect("/account/");
  }

  res.render("account/manage-accounts", {
    title: "Manage Accounts",
    nav,
    sortedAccounts,
    errors: null,
  });
}

async function logout(req, res) {
  res.clearCookie("jwt");
  res.redirect("/");
}

async function deleteConfirmView(req, res) {
  const nav = await utilities.getNav();
  const accountId = parseInt(req.params.account_id);
  const jwtData = res.locals.accountData;

  if (
    !jwtData ||
    (jwtData.account_id !== accountId && jwtData.account_type !== "Admin")
  ) {
    req.flash("notice", "You are not authorized to delete this account.");
    return res.redirect("/account/manage-accounts");
  }

  const accountData = await accountModel.getAccountById(accountId);
  if (!accountData) {
    req.flash("notice", "Account not found.");
    return res.redirect("/account/manage-accounts");
  }

  res.render("account/delete-confirm", {
    title: "Delete Account",
    nav,
    accountData,
    errors: null,
  });
}

async function deleteAccount(req, res) {
  const accountId = parseInt(req.params.account_id);
  const jwtData = res.locals.accountData;

  if (
    !jwtData ||
    (jwtData.account_id !== accountId && jwtData.account_type !== "Admin")
  ) {
    req.flash("notice", "You are not authorized to delete this account.");
    return res.redirect("/account/manage-accounts");
  }

  try {
    await accountModel.deleteAccount(accountId);
    req.flash("notice", "Account successfully deleted.");
    return res.redirect("/account/manage-accounts");
  } catch (error) {
    console.error("Error deleting account:", error);
    req.flash("notice", "Error deleting account. Please try again.");
    return res.redirect("/account/manage-accounts");
  }
}

module.exports = {
  buildLogin,
  buildAccount,
  buildRegister,
  registerAccount,
  accountLogin,
  buildUpdate,
  updateAccount,
  changePassword,
  buildManageAccounts,
  deleteConfirmView,
  deleteAccount,
  logout,
};
