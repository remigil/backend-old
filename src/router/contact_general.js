const router = require("express").Router();
const { body } = require("express-validator");
const ContactGeneral = require("../controller/contactGeneral");
const formValidation = require("../middleware/form_validation");
router.get("/", ContactGeneral.get);
router.get("/getId/:id", ContactGeneral.getId);
router.post(
  "/add",
  //   body("name_country").notEmpty().isLength({ min: 3 }),
  formValidation,
  ContactGeneral.add
);
router.put("/edit/:id", ContactGeneral.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  ContactGeneral.delete
);

module.exports = router;
