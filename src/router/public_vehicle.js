const router = require("express").Router();
const { body } = require("express-validator");
const Public_vehicleController = require("../controller/public_vehicle");
const formValidation = require("../middleware/form_validation");
router.get("/", Public_vehicleController.get);
router.get(
  "/getbysocietyId/",
  formValidation,
  Public_vehicleController.getbySocietyId
);
// router.get("/getbyVehicleId/:id", Public_vehicleController.getbyVehicleId);
router.get("/getId/:id", formValidation, Public_vehicleController.getId);
router.post(
  "/add",
  // body("no_vehicle").notEmpty().isLength({ min: 3 }),
  formValidation,
  Public_vehicleController.add
);
router.put("/edit/:id", Public_vehicleController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  Public_vehicleController.delete
);
router.delete(
  "/hardDelete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  Public_vehicleController.hardDelete
);

module.exports = router;
