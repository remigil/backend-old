const router = require("express").Router();
const { body } = require("express-validator");
const NotifikasiController = require("../controller/notification");
const formValidation = require("../middleware/form_validation");
router.get("/", NotifikasiController.get);
router.get("/mobile", NotifikasiController.getMobile);
router.post(
  "/add",
  //   body("name_fuelVehicle").notEmpty().isLength({ min: 3 }),
  formValidation,
  NotifikasiController.add
);
router.put("/edit/:id", NotifikasiController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  NotifikasiController.delete
);

module.exports = router;
