const { body } = require("express-validator");
const TrxOperationProfilePolda = require("../controller/operation_profile_polda");
const formValidation = require("../middleware/form_validation");
const router = require("express").Router();
const authMiddleware = require("../middleware/authentication");

router.post(
  "/add",
  body("polda_id").notEmpty().isLength({ min: 3 }),
  body("operation_profile_id").notEmpty().isLength({ min: 3 }),
  formValidation,
  TrxOperationProfilePolda.add
);
router.put("/edit/:id", TrxOperationProfilePolda.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  TrxOperationProfilePolda.delete
);
module.exports = router;
