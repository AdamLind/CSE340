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

module.exports = invCont;
