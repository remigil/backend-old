const { body } = require("express-validator");
const TrxOperationProfilePolres = require("../controller/operation_profile_polres");
const formValidation = require("../middleware/form_validation");
const router = require("express").Router();
const authMiddleware = require("../middleware/authentication");

router.post(
  "/add",
  body("polres_id").notEmpty().isLength({ min: 3 }),
  body("operation_profile_id").notEmpty().isLength({ min: 3 }),
  formValidation,
  TrxOperationProfilePolres.add
);
router.put("/edit/:id", TrxOperationProfilePolres.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  TrxOperationProfilePolres.delete
);
module.exports = router;
