const router = require("express").Router();
const { body } = require("express-validator");
const PanicButtonController = require("../controller/panicButton");
const formValidation = require("../middleware/form_validation");
router.get("/", PanicButtonController.get);
router.post("/add", formValidation, PanicButtonController.add);
router.post(
  "/addPeringatan",
  formValidation,
  PanicButtonController.addPeringatan
);
router.put("/edit/:id", PanicButtonController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  PanicButtonController.delete
);

module.exports = router;
