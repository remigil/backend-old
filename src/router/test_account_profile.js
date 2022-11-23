const router = require("express").Router();
const { body } = require("express-validator");
const Test_account_profileController = require("../controller/test_account_profile");
const formValidation = require("../middleware/form_validation");
router.get("/", Test_account_profileController.get);
router.get("/getId/:id", Test_account_profileController.getId);
router.post(
  "/add",
  //   body("name_officer").notEmpty().isLength({ min: 3 }),
  formValidation,
  Test_account_profileController.add
);
router.put("/edit/:id", Test_account_profileController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  Test_account_profileController.delete
);
router.delete(
  "/hardDelete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  Test_account_profileController.hardDelete
);

module.exports = router;
