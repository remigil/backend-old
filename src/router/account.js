const router = require("express").Router();
const { body } = require("express-validator");
const AccountController = require("../controller/account");
const formValidation = require("../middleware/form_validation");
router.get("/", AccountController.get);
router.post(
  "/add",
  //   body("name_officer").notEmpty().isLength({ min: 3 }),
  formValidation,
  AccountController.add
);
router.put("/edit/:id", AccountController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  AccountController.delete
);

module.exports = router;
