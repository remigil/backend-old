const { body } = require("express-validator");
const TrxAccountProfile = require("../controller/trx_account_profile");
const formValidation = require("../middleware/form_validation");
const router = require("express").Router();
const authMiddleware = require("../middleware/authentication");

router.post(
  "/add",
  body("account_id").notEmpty().isLength({ min: 3 }),
  body("officer_id").notEmpty().isLength({ min: 3 }),
  formValidation,
  TrxAccountProfile.add
);
router.put("/edit/:id", TrxAccountProfile.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  TrxAccountProfile.delete
);
module.exports = router;
