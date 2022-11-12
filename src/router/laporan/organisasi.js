const router = require("express").Router();
const { body } = require("express-validator");
const DaftarPeserta = require("../../controller/laporan/organisasi");
const formValidation = require("../../middleware/form_validation");
router.get("/", DaftarPeserta.get);
router.post(
  "/add",
  //   body("name_officer").notEmpty().isLength({ min: 3 }),
  formValidation,
  DaftarPeserta.add
);
router.put("/edit/:id", DaftarPeserta.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  DaftarPeserta.delete
);

module.exports = router;
