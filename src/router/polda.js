const router = require("express").Router();
const { body } = require("express-validator");
const PoldaController = require("../controller/polda");
const formValidation = require("../middleware/form_validation");
router.get("/", PoldaController.get);
router.post(
  "/add",
  body("name_officer").notEmpty().isLength({ min: 3 }),
  formValidation,
  PoldaController.add
);
router.post("/import", formValidation, PoldaController.importExcell);
router.put("/edit/:id", PoldaController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  PoldaController.delete
);
router.get("/getId/:id", PoldaController.getId);
module.exports = router;
