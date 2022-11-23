const router = require("express").Router();
const { body } = require("express-validator");
const LinkController = require("../controller/link");
// const LinkController = require("../controller/news");
const formValidation = require("../middleware/form_validation");
router.get("/", LinkController.get);
router.post(
  "/add",
  //   body("title").notEmpty().isLength({ min: 3 }),
  formValidation,
  LinkController.add
);
router.put("/edit/:id", LinkController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  LinkController.delete
);
router.delete("/hardDelete", formValidation, LinkController.hardDelete);

module.exports = router;
