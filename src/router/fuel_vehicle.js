const router = require("express").Router();
const { body } = require("express-validator");
const FuelVehicleController = require("../controller/fuel_vehicle");
const formValidation = require("../middleware/form_validation");
router.get("/", FuelVehicleController.get);
router.get("/getId/:id", FuelVehicleController.getId);
router.post(
  "/add",
  body("name_fuelVehicle").notEmpty().isLength({ min: 3 }),
  formValidation,
  FuelVehicleController.add
);
router.put("/edit/:id", FuelVehicleController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  FuelVehicleController.delete
);

module.exports = router;
