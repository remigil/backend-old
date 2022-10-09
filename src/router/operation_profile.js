const router = require("express").Router();
const { body } = require("express-validator");
const OperationProfileController = require("../controller/operation_profile");
const formValidation = require("../middleware/form_validation");
router.get("/", OperationProfileController.get);
router.get("/getId/:id", OperationProfileController.getId);
router.post(
  "/add",
  //   body("name_officer").notEmpty().isLength({ min: 3 }),
  formValidation,
  OperationProfileController.add
);
router.put("/edit/:id", OperationProfileController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  OperationProfileController.delete
);

module.exports = router;
