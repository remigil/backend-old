const router = require("express").Router();
const { body } = require("express-validator");
const Brand_vehicleController = require("../controller/brand_vehicle");  
const formValidation = require("../middleware/form_validation");
router.get("/", Brand_vehicleController.get);
router.get(
  "/getId/:id",  
  Brand_vehicleController.getId
);
router.post(
  "/add",
  // body("brand_name").notEmpty().isLength({ min: 3 }),
  formValidation,
  Brand_vehicleController.add
);
router.put("/edit/:id", Brand_vehicleController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  Brand_vehicleController.delete
);

module.exports = router;
