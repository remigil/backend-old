const router = require("express").Router();
const { body } = require("express-validator");
const Polres = require("../controller/polres");
const formValidation = require("../middleware/form_validation");
router.get("/", Polres.get);
router.post(
  "/add",
  body("name_officer").notEmpty().isLength({ min: 3 }),
  formValidation,
  Polres.add
);
router.post("/import", formValidation, Polres.importExcell);
router.put("/edit/:id", Polres.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  Polres.delete
);

module.exports = router;
