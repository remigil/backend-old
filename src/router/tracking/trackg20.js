const router = require("express").Router();
const authMiddleware = require("../../middleware/authentication");
const LocationTrackController = require("../../controller/track/locationTrack");
const form_validation = require("../../middleware/form_validation");

router.get("/getMe", authMiddleware.jwtAuth, LocationTrackController.get);
router.get(
  "/filterPetugas",
  // authMiddleware.jwtAuth,
  LocationTrackController.filterPetugas
);
router.get(
  "/addAccount",
  authMiddleware.jwtAuth,
  LocationTrackController.addDataOfficerToSocket
);
router.get(
  "/getLogout",
  authMiddleware.jwtAuth,
  LocationTrackController.getLogout
);
router.get("/getName", authMiddleware.jwtAuth, LocationTrackController.getName);
router.get("/getUserLocation", LocationTrackController.getByUser);
router.post("/add", form_validation, LocationTrackController.add);
module.exports = router;
