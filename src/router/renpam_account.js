const { body } = require("express-validator");
const RenpamAccount = require("../controller/renpam_account");
const formValidation = require("../middleware/form_validation");
const router = require("express").Router();
const authMiddleware = require("../middleware/authentication");

router.post(
  "/add",
  body("account_id").notEmpty().isLength({ min: 3 }),
  body("officer_id").notEmpty().isLength({ min: 3 }),
  formValidation,
  RenpamAccount.add
);
router.put("/edit/:id", RenpamAccount.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  RenpamAccount.delete
);
module.exports = router;
