const router = require("express").Router();
const { body } = require("express-validator");
const ScheduleController = require("../controller/schedule");
const formValidation = require("../middleware/form_validation");
router.get("/", ScheduleController.get);
router.get("/getId/:id", ScheduleController.getId);
router.post(
  "/add",
  body("activity").notEmpty().isLength({ min: 3 }),
  formValidation,
  ScheduleController.add
);
router.put("/edit/:id", ScheduleController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  ScheduleController.delete
);
router.delete(
  "/hardDelete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  ScheduleController.delete
);

module.exports = router;
