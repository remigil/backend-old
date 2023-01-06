const router = require("express").Router();
const { body } = require("express-validator");
const Bagtik = require("../controller/bagtik");
const formValidation = require("../middleware/form_validation");
router.get("/cctv/daily", Bagtik.get_daily_cctv);
router.get("/cctvintegrasi/daily", Bagtik.get_daily_cctvintegrasi);
router.get("/rtmc/daily", Bagtik.get_daily_rtmc);
router.get("/tmc/daily", Bagtik.get_daily_tmc);

router.get("/cctv/date", Bagtik.get_by_date_cctv);
router.get("/cctvintegrasi/date", Bagtik.get_by_date_cctvintegrasi);
router.get("/rtmc/date", Bagtik.get_by_date_rtmc);
router.get("/tmc/date", Bagtik.get_by_date_tmc);

router.post("/cctv/add", Bagtik.add_cctv);
router.post("/cctvintegrasi/add", Bagtik.add_cctvintegrasi);
router.post("/rtmc/add", Bagtik.add_rtmc);
router.post("/tmc/add", Bagtik.add_tmc);

// router.get("/", CountDitregident.get);
// router.get("/count-month", CountDitregident.countByMonth);

module.exports = router;
