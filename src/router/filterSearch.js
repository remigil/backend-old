const router = require("express").Router();
const { body } = require("express-validator");
const DashboardMobileController = require("../controller/dashboardMobile");
const FilterSearchController = require("../controller/filterSearchMaps");

const formValidation = require("../middleware/form_validation");
router.get("/", FilterSearchController.get);
router.get("/filter2", FilterSearchController.getMultiplePlace);
router.get("/filterDashboardMobile", DashboardMobileController.get);

module.exports = router;
