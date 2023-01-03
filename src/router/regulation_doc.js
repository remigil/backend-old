const router = require("express").Router();
const { body } = require("express-validator");
const Regulation_docController = require("../controller/regulation_doc");
const formValidation = require("../middleware/form_validation");
router.get("/", Regulation_docController.get);
router.get("/mobile", Regulation_docController.getMobile);
router.get("/getId/:id", Regulation_docController.getId);
router.post(
  "/add",
  body("regulation_name").notEmpty().isLength({ min: 3 }),
  formValidation,
  Regulation_docController.add
);
router.put("/edit/:id", Regulation_docController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  Regulation_docController.hardDelete
);
router.delete(
  "/hardDelete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  Regulation_docController.hardDelete
);

router.get("/bycategory/:id", Regulation_docController.getbycategory);

module.exports = router;
