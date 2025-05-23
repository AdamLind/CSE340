// Needed Resources 
const express = require("express")
const router = new express.Router() 
const vehicleController = require("../controllers/vehicleController")

// Route to build inventory by classification view
router.get("/type/:vehicleId", vehicleController.buildByVehicleId);

module.exports = router;