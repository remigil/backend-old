const router = require("express").Router();
const { body } = require("express-validator");
const InputLapMasyarakat = require("../controller/input_lapMasyarakat");
router.post("/giat_prokes", InputLapMasyarakat.add);
router.get("/daily", InputLapMasyarakat.get_daily);
router.get("/monthly", InputLapMasyarakat.get_monthly);
router.get("/date", InputLapMasyarakat.get_by_date);

module.exports = router;
