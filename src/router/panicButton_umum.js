const router = require("express").Router();
const { body } = require("express-validator");
const PanicButtonController = require("../controller/panicButton_umum");
const formValidation = require("../middleware/form_validation");
router.get("/", formValidation, PanicButtonController.get);
router.post("/add", formValidation, PanicButtonController.add);
router.put("/edit/:id", formValidation, PanicButtonController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  PanicButtonController.delete
);
router.delete(
  "/hardDelete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  PanicButtonController.hardDelete
);

module.exports = router;
