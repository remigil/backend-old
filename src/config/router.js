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
  require("../router/anevg20")
);
router.use(
  "/v" + process.env.APP_VERSION + "/ht",
  // authMiddleware.jwtAuth,
  require("../router/trxHt")
);
router.use(
  "/v" + process.env.APP_VERSION + "/laporan/daftar_peserta",
  // authMiddleware.jwtAuth,
  require("../router/laporan/daftar_peserta")
);
router.use(
  "/v" + process.env.APP_VERSION + "/laporan/negara",
  // authMiddleware.jwtAuth,
  require("../router/laporan/negara")
);
router.use(
  "/v" + process.env.APP_VERSION + "/laporan/organisasi",
  // authMiddleware.jwtAuth,
  require("../router/laporan/organisasi")
);
router.use(
  "/v" + process.env.APP_VERSION + "/laporan/jadwal",
  // authMiddleware.jwtAuth,
  require("../router/laporan/jadwal")
);

////////////////////////////////////umum

router.use(
  "/v" + process.env.APP_VERSION + "/sosmed",
  authMiddleware.jwtAuth,
  require("../router/sosmed")
);

// Input data harian
router.use(
  "/v" + process.env.APP_VERSION + "/laka_langgar",
  // authMiddleware.jwtAuth,
  require("../router/input_laka_langgar")
);

router.use(
  "/v" + process.env.APP_VERSION + "/garlantas",
  // authMiddleware.jwtAuth,
  require("../router/input_garlantas")
);

router.use(
  "/v" + process.env.APP_VERSION + "/turjagwali",
  // authMiddleware.jwtAuth,
  require("../router/input_turjagwali")
);

router.use(
  "/v" + process.env.APP_VERSION + "/laka_lantas",
  // authMiddleware.jwtAuth,
  require("../router/input_laka_lantas")
);

router.use(
  "/v" + process.env.APP_VERSION + "/dikmaslantas",
  // authMiddleware.jwtAuth,
  require("../router/input_dikmaslantas")
);

router.use(
  "/v" + process.env.APP_VERSION + "/penyebaran",
  // authMiddleware.jwtAuth,
  require("../router/input_penyebaran")
);

router.use(
  "/v" + process.env.APP_VERSION + "/sim",
  // authMiddleware.jwtAuth,
  require("../router/input_sim")
);

router.use(
  "/v" + process.env.APP_VERSION + "/bpkb",
  // authMiddleware.jwtAuth,
  require("../router/input_bpkb")
);

router.use(
  "/v" + process.env.APP_VERSION + "/stnk",
  // authMiddleware.jwtAuth,
  require("../router/input_stnk")
);

router.use(
  "/v" + process.env.APP_VERSION + "/ranmor",
  // authMiddleware.jwtAuth,
  require("../router/input_ranmor")
);
// End input data harian

// manajemen akun  dasboard
router.use(
  "/v" + process.env.APP_VERSION + "/test_account_user",
  // authMiddleware.jwtAuth,
  require("../router/test_account_user")
);
router.use(
  "/v" + process.env.APP_VERSION + "/test_account_profile",
  // authMiddleware.jwtAuth,
  require("../router/test_account_profile")
);
router.use(
  "/v" + process.env.APP_VERSION + "/test_account_profile_polda",
  // authMiddleware.jwtAuth,
  require("../router/test_account_profile_polda")
);
router.use(
  "/v" + process.env.APP_VERSION + "/test_account_profile_polres",
  // authMiddleware.jwtAuth,
  require("../router/test_account_profile_polres")
);
// end manajemen akun

// etle
router.use(
  "/v" + process.env.APP_VERSION + "/etle",
  // authMiddleware.jwtAuth,
  require("../router/etle")
);

// Dashboard
router.use(
  "/v" + process.env.APP_VERSION + "/ditkamsel",
  // authMiddleware.jwtAuth,
  require("../router/count_ditkamsel")
);

router.use(
  "/v" + process.env.APP_VERSION + "/ditregident",
  // authMiddleware.jwtAuth,
  require("../router/count_ditregident")
);

router.use(
  "/v" + process.env.APP_VERSION + "/ditgakkum",
  // authMiddleware.jwtAuth,
  require("../router/count_ditgakkum")
);

router.use(
  "/v" + process.env.APP_VERSION + "/count-trip-on",
  // authMiddleware.jwtAuth,
  require("../router/count_tripOn")
);
// End Dashboard

router.use(
  "/v" + process.env.APP_VERSION + "/home-statistik",
  // authMiddleware.jwtAuth,
  require("../router/count_home_mobile")
);

// Input laporan operasi khusus
router.use(
  "/v" + process.env.APP_VERSION + "/operasi_langgar",
  // authMiddleware.jwtAuth,
  require("../router/input_operasi_langgar")
);

router.use(
  "/v" + process.env.APP_VERSION + "/operasi_laka",
  // authMiddleware.jwtAuth,
  require("../router/input_operasi_laka")
);

router.use(
  "/v" + process.env.APP_VERSION + "/ntmc",
  // authMiddleware.jwtAuth,
  require("../router/input_ntmc")
);

router.use(
  "/v" + process.env.APP_VERSION + "/anev",
  //authMiddleware.jwtAuth,
  require("../router/anev")
);
// Import File Laporan Harian
router.use(
  "/v" + process.env.APP_VERSION + "/import",
  // authMiddleware.jwtAuth,
  require("../router/import_file")
);

// Laporan masyarakat
router.use(
  "/v" + process.env.APP_VERSION + "/laporan_masyarakat",
  // authMiddleware.jwtAuth,
  require("../router/input_lapMasyarakat")
);

router.use(
  "/v" + process.env.APP_VERSION + "/anev_harian",
  // authMiddleware.jwtAuth,
  require("../router/anev_harian")
);

// Export laphar
router.use(
  "/v" + process.env.APP_VERSION + "/laporan_harian",
  // authMiddleware.jwtAuth,
  require("../router/export_laphar")
);
//link
router.use(
  "/v" + process.env.APP_VERSION + "/link",
  // authMiddleware.jwtAuth,
  require("../router/link")
);
module.exports = router;
