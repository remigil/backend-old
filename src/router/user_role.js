const { body } = require("express-validator");
const UserRoleController = require("../controller/user_role");
const formValidation = require("../middleware/form_validation");
const router = require("express").Router();
router.get("/", UserRoleController.get);
router.post(
  "/add",
  body("name").notEmpty().isLength({ min: 3 }),
  formValidation,
  UserRoleController.add
);
router.put("/edit/:id", UserRoleController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  UserRoleController.delete
);
module.exports = router;
