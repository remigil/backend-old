const router = require("express").Router();
const validationRules = require("express-validator");
const formValidator = require("../middleware/form_validation");
const controller = require("../controller/anev");
router.get(
  "/getMonthly",
  validationRules.query("mode").notEmpty().isIn(["view", "pdf-download"]),
  validationRules.query("month").notEmpty().isNumeric(),
  validationRules.query("year").notEmpty().isNumeric(),
  formValidator,
  controller.getMonthly
);
router.get(
  "/getDaily",
  validationRules.query("mode").notEmpty().isIn(["view", "pdf-download"]),
  validationRules.query("date").notEmpty().isDate({ format: "YYYY-MM-DD" }),
  formValidator,
  controller.getDaily
);

module.exports = router;
