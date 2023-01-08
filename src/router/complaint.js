const router = require("express").Router();
const { body } = require("express-validator");
const ComplaintController = require("../controller/complaint");
const formValidation = require("../middleware/form_validation");
router.get("/", ComplaintController.get);
router.get("/getId/:id", ComplaintController.getId);
router.post(
  "/add",
  body("name_complaint").notEmpty().isLength({ min: 3 }),
  formValidation,
  ComplaintController.add
);
router.put("/edit/:id", ComplaintController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  ComplaintController.delete
);
router.delete(
  "/hardDelete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  ComplaintController.hardDelete
);

module.exports = router;
