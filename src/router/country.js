const router = require("express").Router();
const { body } = require("express-validator");
const CountryController = require("../controller/country");
const formValidation = require("../middleware/form_validation");
router.get("/", CountryController.get);
router.get("/getId/:id", CountryController.getId);
router.post(
  "/add",
  body("name_country").notEmpty().isLength({ min: 3 }),
  formValidation,
  CountryController.add
);
router.put("/edit/:id", CountryController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  CountryController.delete
);

module.exports = router;
