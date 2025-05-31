const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors: null,
  });
};

invCont.buildByVehicleId = async function (req, res, next) {
  const vehicleId = req.params.vehicleId;
  const data = await invModel.getVehicleById(vehicleId);
  let nav = await utilities.getNav();

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  data[0].formatted_miles = data[0].inv_miles.toLocaleString("en-US");

  data[0].formatted_price = formatter.format(data[0].inv_price);

  res.render("./inventory/detail", {
    title: data[0].inv_make + " " + data[0].inv_model,
    nav,
    vehicle: data[0],
    errors: null,
  });
};

invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav();

  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
  });
};

invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  });
};

invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body;
  let nav = await utilities.getNav();

  try {
    const result = await invModel.addClassification(classification_name);

    if (result) {
      req.flash("notice", "Classification successfully added.");
      nav = await utilities.getNav(); // update nav
      return res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        message: "Classification successfully added.",
        errors: null,
      });
    } else {
      throw new Error("Insert failed");
    }
  } catch (error) {
    console.log("Error adding classification:", error);
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      message: "Error: Could not add classification.",
      errors: [{ msg: error.message }],
      classification_name,
    });
  }
};

// *************************
//   ADD-INVENTORY VIEW
// *************************

invCont.buildAddInventoryView = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList();
  res.render("inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    classificationList,
    errors: null,
  });
};

// Show add-inventory form
invCont.buildAddInventoryView = async function (req, res, next) {
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList();
  res.render("inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    classificationList,
    errors: null,
  });
};

// Handle form POST
invCont.addInventory = async function (req, res) {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
  } = req.body;

  const result = await invModel.addInventory(
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color
  );

  if (result) {
    req.flash("notice", "Inventory item added successfully!");
    res.redirect("/inv");
  } else {
    let nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(
      classification_id
    );
    req.flash("notice", "Failed to add inventory item.");
    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      ...req.body,
    });
  }
};

module.exports = invCont;
