const router = require("express").Router();
const { body } = require("express-validator");
const CctvController = require("../controller/cctv");
const formValidation = require("../middleware/form_validation");
router.get("/", CctvController.get);
router.get("/getId/:id", CctvController.getId);
router.post(
  "/add",
  body("address_cctv").notEmpty().isLength({ min: 3 }),
  formValidation,
  CctvController.add
);
router.post("/import", formValidation, CctvController.importExcell);
router.put("/edit/:id", CctvController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  CctvController.delete
);

module.exports = router;
