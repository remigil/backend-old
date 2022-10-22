const router = require("express").Router();
const { body } = require("express-validator");
const BodycamController = require("../controller/bodycam");
const formValidation = require("../middleware/form_validation");
router.get("/", BodycamController.get);
router.get("/getId/:id", BodycamController.getId);
router.post(
  "/add",
  body("address_bodycam").notEmpty().isLength({ min: 3 }),
  formValidation,
  BodycamController.add
);
router.post("/import", formValidation, BodycamController.importExcell);
router.put("/edit/:id", BodycamController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  BodycamController.hardDelete
);

module.exports = router;
