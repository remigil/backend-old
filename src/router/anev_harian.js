const router = require("express").Router();
const { body } = require("express-validator");
const AnevHarian = require("../controller/anev_harian");

router.get("/topPolda", AnevHarian.topPolda_Kecelakaan);

module.exports = router;
