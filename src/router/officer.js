const router = require("express").Router();
const { body } = require("express-validator");
const OfficerController = require("../controller/officer");  
const formValidation = require("../middleware/form_validation");
router.get("/", OfficerController.get);
router.get(
  "/getId/:id",  
  OfficerController.getId
);
router.post(
  "/add",
  body("name_officer").notEmpty().isLength({ min: 3 }),
  formValidation,
  OfficerController.add
);
router.put("/edit/:id", OfficerController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  OfficerController.delete
);

module.exports = router;
