const router = require("express").Router();
const { body } = require("express-validator");
const SDMPolantas = require("../controller/bagrenmin_sdm_polantas");
const Rencana_Anggaran = require("../controller/bagrenmin_rengar");
const formValidation = require("../middleware/form_validation");
router.get("/rengar/daily", Rencana_Anggaran.get_daily);
router.get("/rengar/date", Rencana_Anggaran.get_by_date);

router.get("/sdm_polantas/daily", SDMPolantas.get_daily);
router.get("/sdm_polantas/date", SDMPolantas.get_by_date);
router.post("/sdm_polantas/add", SDMPolantas.add);

// router.get("/", CountDitregident.get);
// router.get("/count-month", CountDitregident.countByMonth);

module.exports = router;
