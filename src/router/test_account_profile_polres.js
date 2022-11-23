const { body } = require("express-validator");
const Test_account_profile_polresController = require("../controller/test_account_profile_polres");
const formValidation = require("../middleware/form_validation");
const router = require("express").Router();
const authMiddleware = require("../middleware/authentication");

router.post(
  "/add",
  body("polres_id").notEmpty().isLength({ min: 3 }),
  body("test_account_id").notEmpty().isLength({ min: 3 }),
  formValidation,
  Test_account_profile_polresController.add
);
router.put("/edit/:id", Test_account_profile_polresController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  Test_account_profile_polresController.delete
);
module.exports = router;
