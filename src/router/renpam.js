const router = require("express").Router();
const { body } = require("express-validator");
const RenpamController = require("../controller/renpam");
const formValidation = require("../middleware/form_validation");
router.get("/", RenpamController.get);
router.get("/getId/:id", RenpamController.getId);
router.post(
  "/add",
  //   body("activity").notEmpty().isLength({ min: 3 }),
  formValidation,
  RenpamController.add
);
router.put("/edit/:id", RenpamController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  RenpamController.delete
);
router.delete(
  "/hardDelete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  RenpamController.delete
);

module.exports = router;
