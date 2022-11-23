const router = require("express").Router();
const { body } = require("express-validator");
const CategoryNewsController = require("../controller/category_news");
const formValidation = require("../middleware/form_validation");
router.get("/", CategoryNewsController.get);
router.get("/getId/:id", CategoryNewsController.getId);
router.post(
  "/add",
  body("name_category_news").notEmpty().isLength({ min: 1 }),
  formValidation,
  CategoryNewsController.add
);
router.put("/edit/:id", CategoryNewsController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  CategoryNewsController.delete
);
router.delete("/hardDelete", formValidation, CategoryNewsController.hardDelete);

module.exports = router;
