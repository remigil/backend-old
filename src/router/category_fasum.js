const router = require("express").Router();
const { body } = require("express-validator");
const CategoryFasumController = require("../controller/category_fasum");
const formValidation = require("../middleware/form_validation");
router.get("/", CategoryFasumController.get);
router.get("/getId/:id", CategoryFasumController.getId);
router.post(
  "/add",
  body("name_category_fasum").notEmpty().isLength({ min: 3 }),
  formValidation,
  CategoryFasumController.add
);
router.post("/import", formValidation, CategoryFasumController.importExcell);
router.put("/edit/:id", CategoryFasumController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  CategoryFasumController.delete
);

module.exports = router;
