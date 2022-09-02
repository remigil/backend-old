const router = require("express").Router();
const { body } = require("express-validator");
const FilterSearchController = require("../controller/filterSearchMaps");

const formValidation = require("../middleware/form_validation");
router.get("/", FilterSearchController.get);

module.exports = router;
