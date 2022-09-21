const router = require("express").Router();
const { body } = require("express-validator");
const StructuralController = require("../controller/structural");
const formValidation = require("../middleware/form_validation");
router.get("/", StructuralController.get);
router.get("/getId/:id", StructuralController.getId);
router.post(
  "/add",
  body("name_structural").notEmpty().isLength({ min: 3 }),
  formValidation,
  StructuralController.add
);
router.put("/edit/:id", StructuralController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  StructuralController.delete
);

module.exports = router;
