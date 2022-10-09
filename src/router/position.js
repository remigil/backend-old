const router = require("express").Router();
const { body } = require("express-validator");
const PositionController = require("../controller/position");
const formValidation = require("../middleware/form_validation");
router.get("/", PositionController.get);
router.get("/getId/:id", PositionController.getId);
router.post(
  "/add",
  body("name_position").notEmpty().isLength({ min: 3 }),
  formValidation,
  PositionController.add
);
router.put("/edit/:id", PositionController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  PositionController.delete
);

module.exports = router;
