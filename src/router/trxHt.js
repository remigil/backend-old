const router = require("express").Router();
const { body } = require("express-validator");
const TrxHt = require("../controller/htController");
const formValidation = require("../middleware/form_validation");
router.get("/", TrxHt.get);
router.get("/getId/:id", TrxHt.getId);
router.post(
  "/add",

  TrxHt.add
);
router.put("/edit/:id", formValidation, TrxHt.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  TrxHt.hardDelete
);

module.exports = router;
