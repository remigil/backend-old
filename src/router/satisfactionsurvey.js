const router = require("express").Router();
const { body } = require("express-validator");
const SatisfactionController = require("../controller/satisfactionsurvey");
const formValidation = require("../middleware/form_validation");
router.get("/", SatisfactionController.get);
router.get("/getId/:id", SatisfactionController.getId);
router.get("/countdesign", SatisfactionController.countdesign);
router.get("/countconvenience", SatisfactionController.countconvenience);
router.get("/countaccurate", SatisfactionController.countaccurate);
router.get("/countfast", SatisfactionController.countfast);
router.post(
  "/add",
  body("name_survey").notEmpty().isLength({ min: 3 }),
  formValidation,
  SatisfactionController.add
);
router.put("/edit/:id", SatisfactionController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  SatisfactionController.delete
);
router.delete(
  "/hardDelete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  SatisfactionController.hardDelete
);

module.exports = router;
