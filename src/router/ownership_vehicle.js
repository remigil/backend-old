const router = require("express").Router();
const { body } = require("express-validator");
const OwnershipVehicleController = require("../controller/ownership_vehicle");
const formValidation = require("../middleware/form_validation");
router.get("/", OwnershipVehicleController.get);
router.get("/getId/:id", OwnershipVehicleController.getId);
router.post(
  "/add",
  body("name_ownershipVehicle").notEmpty().isLength({ min: 3 }),
  formValidation,
  OwnershipVehicleController.add
);
router.put("/edit/:id", OwnershipVehicleController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  OwnershipVehicleController.delete
);

module.exports = router;
