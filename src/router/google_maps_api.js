const { body } = require("express-validator");
const GoogleAPIs = require("../controller/google_maps_api");
const router = require("express").Router();
const formValidation = require("../middleware/form_validation");
router.post(
  "/direction",
  body("latOrigin").notEmpty().isNumeric(),
  body("lngOrigin").notEmpty().isNumeric(),
  body("latDestination").notEmpty().isNumeric(),
  body("lngDestination").notEmpty().isNumeric(),
  formValidation,
  GoogleAPIs.directionAPI
);
router.post(
  "/reverse-geocode",
  body("lat").notEmpty().isNumeric(),
  body("lng").notEmpty().isNumeric(),
  formValidation,
  GoogleAPIs.reverseGeocodingAPI
);
module.exports = router;
