const router = require("express").Router();
const { body } = require("express-validator");
const KabupatenController = require("../controller/wilayah/kabupaten");
const Provinsi = require("../controller/wilayah/provinsi");
const formValidation = require("../middleware/form_validation");
router.get("/provinsi", Provinsi.get);
router.post("/import", formValidation, Provinsi.importExcell);
router.get("/kabupaten", Provinsi.get);
router.post(
  "/kabupaten/import",
  formValidation,
  KabupatenController.importExcell
);

module.exports = router;
