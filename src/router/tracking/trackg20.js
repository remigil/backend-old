const router = require("express").Router();
const authMiddleware = require("../../middleware/authentication");
const LocationTrackController = require("../../controller/track/locationTrack");
const form_validation = require("../../middleware/form_validation");

router.get("/getMe", authMiddleware.jwtAuth, LocationTrackController.get);
router.get("/getUserLocation", LocationTrackController.getByUser);
router.post("/add", form_validation, LocationTrackController.add);
module.exports = router;
