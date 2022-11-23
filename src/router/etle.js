const router = require("express").Router();
const { body } = require("express-validator");
const EtleController = require("../controller/etle");
const formValidation = require("../middleware/form_validation");
router.get("/", EtleController.get);
router.get("/getId/:id", EtleController.getId);
router.post(
  "/add",
  body("address_etle").notEmpty().isLength({ min: 3 }),
  formValidation,
  EtleController.add
);
router.post("/import", formValidation, EtleController.importExcell);
router.put("/edit/:id", EtleController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  EtleController.delete
);

module.exports = router;
