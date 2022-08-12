const router = require("express").Router();
require("dotenv").config();
router.use(
  "/v" + process.env.APP_VERSION + "/gmaps-api",
  require("../router/google_maps_api")
);
router.use(
  "/v" + process.env.APP_VERSION + "/auth",
  require("../router/authentication")
);
module.exports = router;
