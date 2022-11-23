const router = require("express").Router();
const { body } = require("express-validator");
const Test_account_userController = require("../controller/test_account_user");
const formValidation = require("../middleware/form_validation");
router.get("/", Test_account_userController.get);
router.get("/getId/:id", Test_account_userController.getId);
router.post(
  "/add",
  //   body("name_officer").notEmpty().isLength({ min: 3 }),
  formValidation,
  Test_account_userController.add
);
router.put("/edit/:id", Test_account_userController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  Test_account_userController.delete
);
router.delete(
  "/hardDelete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  Test_account_userController.hardDelete
);

module.exports = router;
