const { body } = require("express-validator");
const RenpamVip = require("../controller/renpam_vip");
const formValidation = require("../middleware/form_validation");
const router = require("express").Router();
const authMiddleware = require("../middleware/authentication");

router.post(
  "/add",
  body("account_id").notEmpty().isLength({ min: 3 }),
  body("officer_id").notEmpty().isLength({ min: 3 }),
  formValidation,
  RenpamVip.add
);
router.put("/edit/:id", RenpamVip.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  RenpamVip.delete
);
module.exports = router;
