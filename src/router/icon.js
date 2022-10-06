const router = require("express").Router();
const { body } = require("express-validator");
const IconController = require("../controller/icon");
const formValidation = require("../middleware/form_validation");
router.get("/", IconController.get);
router.get("/getId/:id", IconController.getId);
router.post(
  "/add",
  body("name_icon").notEmpty().isLength({ min: 3 }),
  formValidation,
  IconController.add
);
router.put("/edit/:id", IconController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  IconController.delete
);

module.exports = router;
