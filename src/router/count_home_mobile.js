const router = require("express").Router();
const { body } = require("express-validator");
const CountHomeMobile = require("../controller/count_home_mobile");
const formValidation = require("../middleware/form_validation");
router.get("/kecelakaan", CountHomeMobile.kecelakaan);
router.get("/sim", CountHomeMobile.sim);
router.get("/pelanggaran", CountHomeMobile.pelanggaran);
router.get("/kendaraan", CountHomeMobile.kendaraan);

module.exports = router;
