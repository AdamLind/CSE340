const { body, validationResult } = require("express-validator");
const utilities = require("."); // Adjust path if needed
const validate = {};

/* **********************************
 * Classification Validation Rules
 * ********************************* */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .withMessage("Please enter a classification name.")
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("Classification name must not contain spaces or special characters."),
  ];
};

/* **********************************
 * Check Classification Data
 * ********************************* */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: errors.array(),
      message: null,
      classification_name, // keep input value on error
    });
  }

  next();
};

validate.inventoryRules = () => {
  return [
    body("classification_id").isInt().withMessage("Please choose a valid classification."),
    body("inv_make").trim().notEmpty().withMessage("Please enter a make.").matches(/^[A-Za-z0-9\s]+$/).withMessage("Make must not contain special characters."),
    body("inv_model").trim().notEmpty().withMessage("Please enter a model.").matches(/^[A-Za-z0-9\s]+$/).withMessage("Model must not contain special characters."),
    body("inv_description").trim().notEmpty().withMessage("Please enter a description."),
    body("inv_image").trim().notEmpty().withMessage("Please enter an image path."),
    body("inv_thumbnail").trim().notEmpty().withMessage("Please enter a thumbnail path."),
    body("inv_price").isFloat({ gt: 0 }).withMessage("Please enter a valid price."),
    body("inv_year").isInt({ min: 1900, max: 2100 }).withMessage("Enter a valid year."),
    body("inv_miles").isInt({ min: 0 }).withMessage("Enter a valid mileage."),
    body("inv_color").trim().notEmpty().withMessage("Enter a color.").matches(/^[A-Za-z0-9\s]+$/).withMessage("Color must not contain special characters."),
  ]
}

validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const classificationList = await utilities.buildClassificationList(req.body.classification_id)
    let nav = await utilities.getNav()
    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: errors.array(),
      ...req.body, // Sticky values
    })
    return
  }
  next()
}

validate.newInventoryRules = () => {
  return [
    body("classification_id").isInt().withMessage("Please choose a valid classification."),
    body("inv_make").trim().notEmpty().withMessage("Please enter a make.").matches(/^[A-Za-z0-9\s]+$/).withMessage("Make must not contain special characters."),
    body("inv_model").trim().notEmpty().withMessage("Please enter a model.").matches(/^[A-Za-z0-9\s]+$/).withMessage("Model must not contain special characters."),
    body("inv_description").trim().notEmpty().withMessage("Please enter a description."),
    body("inv_image").trim().notEmpty().withMessage("Please enter an image path."),
    body("inv_thumbnail").trim().notEmpty().withMessage("Please enter a thumbnail path."),
    body("inv_price").isFloat({ gt: 0 }).withMessage("Please enter a valid price."),
    body("inv_year").isInt({ min: 1900, max: 2100 }).withMessage("Enter a valid year."),
    body("inv_miles").isInt({ min: 0 }).withMessage("Enter a valid mileage."),
    body("inv_color").trim().notEmpty().withMessage("Enter a color.").matches(/^[A-Za-z0-9\s]+$/).withMessage("Color must not contain special characters."),
  ]
}

validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const classificationList = await utilities.buildClassificationList(req.body.classification_id)
    let nav = await utilities.getNav()
    res.render("inventory/edit-inventory", {
      inv_id: req.params.id,
      title: "Edit Vehicle",
      nav,
      classificationList,
      errors: errors.array(),
      ...req.body, // Sticky values
    })
    return
  }
  next()
}

module.exports = validate;
