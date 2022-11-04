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
  "/v" + process.env.APP_VERSION + "/day_report",
  // authMiddleware.jwtAuth,
  require("../router/day_report")
);

router.use(
  "/v" + process.env.APP_VERSION + "/schedule",
  authMiddleware.jwtAuth,
  require("../router/schedule")
);

router.use(
  "/v" + process.env.APP_VERSION + "/category_schedule",
  authMiddleware.jwtAuth,
  require("../router/category_schedule")
);

// MASTER DATA
router.use(
  "/v" + process.env.APP_VERSION + "/position",
  authMiddleware.jwtAuth,
  require("../router/position")
);
router.use(
  "/v" + process.env.APP_VERSION + "/country",
  authMiddleware.jwtAuth,
  require("../router/country")
);
router.use(
  "/v" + process.env.APP_VERSION + "/rank_officer",
  authMiddleware.jwtAuth,
  require("../router/rank_officer")
);
router.use(
  "/v" + process.env.APP_VERSION + "/structural",
  authMiddleware.jwtAuth,
  require("../router/structural")
);
router.use(
  "/v" + process.env.APP_VERSION + "/ownership_vehicle",
  authMiddleware.jwtAuth,
  require("../router/ownership_vehicle")
);
router.use(
  "/v" + process.env.APP_VERSION + "/fuel_vehicle",
  authMiddleware.jwtAuth,
  require("../router/fuel_vehicle")
);

// CCTV
router.use(
  "/v" + process.env.APP_VERSION + "/cctv",
  authMiddleware.jwtAuth,
  require("../router/cctv")
);

// bodycam
router.use(
  "/v" + process.env.APP_VERSION + "/bodycam",
  authMiddleware.jwtAuth,
  require("../router/bodycam")
);

// FASUM
router.use(
  "/v" + process.env.APP_VERSION + "/category_fasum",
  authMiddleware.jwtAuth,
  require("../router/category_fasum")
);
router.use(
  "/v" + process.env.APP_VERSION + "/fasum",
  authMiddleware.jwtAuth,
  require("../router/fasum")
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
//---------- trx account profile
router.use(
  "/v" + process.env.APP_VERSION + "/account-officer",
  authMiddleware.jwtAuth,
  require("../router/trx_account_officer")
);
// --------- operation profile
router.use(
  "/v" + process.env.APP_VERSION + "/operation-profile",
  authMiddleware.jwtAuth,
  require("../router/operation_profile")
);
// --------- operation profile polda
router.use(
  "/v" + process.env.APP_VERSION + "/operation-profile-polda",
  authMiddleware.jwtAuth,
  require("../router/trx_operation_profile_polda")
);
router.use(
  "/v" + process.env.APP_VERSION + "/operation-profile-polres",
  authMiddleware.jwtAuth,
  require("../router/trx_operation_profile_polres")
);

router.use(
  "/v" + process.env.APP_VERSION + "/renpam",
  authMiddleware.jwtAuth,
  require("../router/renpam")
);
router.use(
  "/v" + process.env.APP_VERSION + "/renpam-account",
  authMiddleware.jwtAuth,
  require("../router/renpam_account")
);
router.use(
  "/v" + process.env.APP_VERSION + "/renpam-vip",
  authMiddleware.jwtAuth,
  require("../router/renpam_vip")
);
router.use(
  "/v" + process.env.APP_VERSION + "/filter-search",
  authMiddleware.jwtAuth,
  require("../router/filterSearch")
);
router.use(
  "/v" + process.env.APP_VERSION + "/panic-button",
  authMiddleware.jwtAuth,
  require("../router/panicButton")
);
router.use(
  "/v" + process.env.APP_VERSION + "/report",
  authMiddleware.jwtAuth,
  require("../router/report")
);

router.use(
  "/v" + process.env.APP_VERSION + "/notifikasi",
  authMiddleware.jwtAuth,
  require("../router/notifikasi")
);
router.use(
  "/v" + process.env.APP_VERSION + "/contact-general",
  authMiddleware.jwtAuth,
  require("../router/contact_general")
);

router.use(
  "/v" + process.env.APP_VERSION + "/regulation_doc",
  authMiddleware.jwtAuth,
  require("../router/regulation_doc")
);

router.use(
  "/v" + process.env.APP_VERSION + "/icon",
  authMiddleware.jwtAuth,
  require("../router/icon")
);

router.use(
  "/v" + process.env.APP_VERSION + "/logout",
  // authMiddleware.jwtAuth,
  require("../router/report_login")
);
router.use(
  "/v" + process.env.APP_VERSION + "/reportMobile",
  // authMiddleware.jwtAuth,
  require("../router/report_login")
);
router.use(
  "/anev-daily",
  // authMiddleware.jwtAuth,
  require("../router/anev")
);

module.exports = router;
