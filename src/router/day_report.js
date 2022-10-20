const router = require("express").Router();
const { body } = require("express-validator");
const DayReportController = require("../controller/day_report");
const formValidation = require("../middleware/form_validation");
router.get("/", DayReportController.get);
router.get("/getId/:id", DayReportController.getId);
router.post(
  "/add",
  // body("name_position").notEmpty().isLength({ min: 3 }),
  formValidation,
  DayReportController.add
);
router.put("/edit/:id", DayReportController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  DayReportController.delete
);

module.exports = router;
