const router = require("express").Router();
const { body } = require("express-validator");
const EtilangPerkaraController = require("../controller/etilang_perkara");
const formValidation = require("../middleware/form_validation");
router.get("/", EtilangPerkaraController.get);
router.get("/getId/:id", EtilangPerkaraController.getId);
router.post(
  "/add",
  body("no_bayar").notEmpty().isLength({ min: 3 }),
  formValidation,
  EtilangPerkaraController.add
);
router.post("/addGeoJson", formValidation, EtilangPerkaraController.addGeoJson);
router.post("/import", formValidation, EtilangPerkaraController.importExcell);
router.put("/edit/:id", EtilangPerkaraController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  EtilangPerkaraController.hardDelete
);

module.exports = router;
