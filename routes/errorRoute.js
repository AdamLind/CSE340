const express = require("express")
const router = express.Router()
const testController = require("../controllers/errorController")
const utilities = require("../utilities")

// Route that intentionally triggers an error
router.get("/500", utilities.handleErrors(testController.triggerError))

module.exports = router
