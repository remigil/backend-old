const router = require("express").Router();
const { body } = require("express-validator");
const SosmedController = require("../controller/sosmed");
const formValidation = require("../middleware/form_validation");
router.get("/", SosmedController.get);
router.get("/getId/:id", SosmedController.getId);
router.post(
  "/add",
  body("name_sosmed").notEmpty().isLength({ min: 3 }),
  formValidation,
  SosmedController.add
);
router.put("/edit/:id", SosmedController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  SosmedController.delete
);
router.delete(
  "/hardDelete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  SosmedController.hardDelete
);

module.exports = router;
