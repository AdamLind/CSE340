const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const vehicleCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
vehicleCont.buildByClassificationId = async function (req, res, next) {
  const vehicle_id = req.params.vehicleId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

module.exports = vehicleCont;
