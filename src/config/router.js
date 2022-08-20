const router = require("express").Router();
const authMiddleware = require("../middleware/authentication");
require("dotenv").config();
router.use(
  "/v" + process.env.APP_VERSION + "/gmaps-api",
  authMiddleware.jwtAuth,
  require("../router/google_maps_api")
);
router.use(
  "/v" + process.env.APP_VERSION + "/user-role",
  authMiddleware.jwtAuth,
  require("../router/user_role")
);
router.use(
  "/v" + process.env.APP_VERSION + "/auth",
  require("../router/authentication")
);
router.use(
  "/v" + process.env.APP_VERSION + "/user",
  authMiddleware.jwtAuth,
  require("../router/user")
);

router.use(
  "/v" + process.env.APP_VERSION + "/track-notif",
  authMiddleware.jwtAuth,
  require("../router/token_track_notif")
);

//test
// -------- OPERASI
router.use(
  "/v" + process.env.APP_VERSION + "/vehicle",
  authMiddleware.jwtAuth,
  require("../router/vehicle")
);
router.use(
  "/v" + process.env.APP_VERSION + "/officer",
  authMiddleware.jwtAuth,
  require("../router/officer")
);
router.use(
  "/v" + process.env.APP_VERSION + "/vip",
  authMiddleware.jwtAuth,
  require("../router/vip")
);

router.use(
  "/v" + process.env.APP_VERSION + "/schedule",
  authMiddleware.jwtAuth,
  require("../router/schedule")
);

//--------tracking

router.use(
  "/track-location",
  authMiddleware.jwtAuth,
  require("../router/tracking/trackg20")
);

// -------- polda
router.use(
  "/v" + process.env.APP_VERSION + "/polda",
  authMiddleware.jwtAuth,
  require("../router/polda")
);
router.use(
  "/v" + process.env.APP_VERSION + "/polres",
  authMiddleware.jwtAuth,
  require("../router/polres")
);

router.use(
  "/v" + process.env.APP_VERSION + "/account",
  authMiddleware.jwtAuth,
  require("../router/account")
);

module.exports = router;
