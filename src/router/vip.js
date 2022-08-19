const router = require("express").Router();
const { body } = require("express-validator");
const VipController = require("../controller/vip");  
const formValidation = require("../middleware/form_validation");
router.get("/", VipController.get);
router.post(
  "/add",
  body("name_vip").notEmpty().isLength({ min: 3 }),
  formValidation,
  VipController.add
);
router.put("/edit/:id", VipController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  VipController.delete
);

module.exports = router;
