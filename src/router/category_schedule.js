const router = require("express").Router();
const { body } = require("express-validator");
const CategoryScheduleController = require("../controller/category_schedule");
const formValidation = require("../middleware/form_validation");
router.get("/", CategoryScheduleController.get);
router.get("/getId/:id", CategoryScheduleController.getId);
router.post(
  "/add",
  body("name_category_schedule").notEmpty().isLength({ min: 3 }),
  formValidation,
  CategoryScheduleController.add
);
router.post("/import", formValidation, CategoryScheduleController.importExcell);
router.put("/edit/:id", CategoryScheduleController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  CategoryScheduleController.hardDelete
);

module.exports = router;
