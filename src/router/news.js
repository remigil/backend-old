const router = require("express").Router();
const { body } = require("express-validator");
const NewsController = require("../controller/news");
const formValidation = require("../middleware/form_validation");
router.get("/", NewsController.get);
router.get("/getIdweb/:id", NewsController.getIdweb);
// router.get("/getbycategory", NewsController.getbycategory);
router.post(
  "/add",
  body("title").notEmpty().isLength({ min: 3 }),
  formValidation,
  NewsController.add
);
router.put("/edit/:id", NewsController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  NewsController.delete
);
router.delete("/hardDelete", formValidation, NewsController.hardDelete);

module.exports = router;
