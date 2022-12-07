const router = require("express").Router();
const { body } = require("express-validator");
const SatpasController = require("../controller/satpas");
const formValidation = require("../middleware/form_validation");
router.get("/", SatpasController.get);
router.get("/getId/:id", SatpasController.getId);
router.post(
  "/add",
  body("name_satpas").notEmpty().isLength({ min: 3 }),
  formValidation,
  SatpasController.add
);
router.put("/edit/:id", SatpasController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  SatpasController.delete
);
router.delete(
  "/hardDelete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  SatpasController.hardDelete
);

router.get("/getPolda/:id", SatpasController.get_by_polda);

module.exports = router;
