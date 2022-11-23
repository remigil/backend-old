const router = require("express").Router();
const { body } = require("express-validator");
const FaqController = require("../controller/faq");
const formValidation = require("../middleware/form_validation");
router.get("/", FaqController.get);
router.post(
  "/add",
  body("question").notEmpty().isLength({ min: 3 }),
  formValidation,
  FaqController.add
);
router.put("/edit/:id", FaqController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  FaqController.delete
);
router.delete(
  "/hardDelete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  FaqController.hardDelete
);

module.exports = router;
