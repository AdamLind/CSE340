// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const invValidate = require("../utilities/inventory-validation");
const utilities = require("../utilities/");

router.get(
  "/",
  utilities.checkAdminOrEmployee,
  utilities.handleErrors(invController.buildManagementView)
);

router.get(
  "/edit/:inv_id",
  utilities.checkAdminOrEmployee,
  utilities.handleErrors(invController.editInventoryView)
);

router.get(
  "/delete/:inv_id",
  utilities.checkAdminOrEmployee,
  utilities.handleErrors(invController.deleteConfirmView)
);

router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);
// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

router.get(
  "/detail/:vehicleId",
  utilities.handleErrors(invController.buildByVehicleId)
);

// Build add-classification view
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
);

// Build add-inventory view
router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddInventoryView)
);

router.post(
  "/delete/:inv_id",
  utilities.handleErrors(invController.deleteInventoryItem)
);

router.post(
  "/update/",
  invValidate.newInventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  invController.addClassification
);
// Process add-inventory form
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  invController.addInventory
);

module.exports = router;
