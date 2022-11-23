const router = require("express").Router();
const { body } = require("express-validator");
const PanduanController = require("../controller/panduan");
const formValidation = require("../middleware/form_validation");
router.get("/", PanduanController.get);
router.post(
  "/add",
  body("name_panduan").notEmpty().isLength({ min: 3 }),
  formValidation,
  PanduanController.add
);
router.put("/edit/:id", PanduanController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  PanduanController.delete
);
router.delete(
  "/hardDelete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  PanduanController.hardDelete
);

module.exports = router;
