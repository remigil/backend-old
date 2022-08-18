const router = require("express").Router();

const LocationTrackController = require("../../controller/track/locationTrack");
const form_validation = require("../../middleware/form_validation");

router.get("/getMe", LocationTrackController.get);
router.get("/getUserLocation/:id", LocationTrackController.getByUser);
router.post("/add", form_validation, LocationTrackController.add);
module.exports = router;
