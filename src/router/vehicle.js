const router = require("express").Router();
const { body } = require("express-validator");
const VehicleController = require("../controller/vehicle");
const formValidation = require("../middleware/form_validation");
router.get("/", VehicleController.get);
router.get("/getId/:id", VehicleController.getId);
router.post(
  "/add",
  body("no_vehicle").notEmpty().isLength({ min: 3 }),
  formValidation,
  VehicleController.add
);
router.post("/importExcell", formValidation, VehicleController.importExcell);
router.put("/edit/:id", VehicleController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  VehicleController.delete
);

module.exports = router;
