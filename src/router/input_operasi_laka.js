const router = require("express").Router();
const { body } = require("express-validator");
const InputOperasiLakalantas = require("../controller/input_operasi_lakalantas");
const InputOperasiPekerjaanKorban = require("../controller/input_operasi_pekerjaankorban");
const InputOperasiPekerjaanPelaku = require("../controller/input_operasi_pekerjaanpelaku");
const InputOperasiPendidikanKorban = require("../controller/input_operasi_pendidikankorban");
const InputOperasiLakaRanmor = require("../controller/input_operasi_lakaranmor");
const InputOperasiUsiaKorban = require("../controller/input_operasi_usiakorban");
const InputOperasiUsiaPelaku = require("../controller/input_operasi_usiapelaku");

router.post("/lakalantas", InputOperasiLakalantas.add);
router.post("/pekerjaan-korban", InputOperasiPekerjaanKorban.add);
router.post("/pekerjaan-pelaku", InputOperasiPekerjaanPelaku.add);
router.post("/pendidikan-korban", InputOperasiPendidikanKorban.add);
router.post("/laka-ranmor", InputOperasiLakaRanmor.add);
router.post("/usia-korban", InputOperasiUsiaKorban.add);

router.get("/kecelakaan-grafik", InputOperasiLakalantas.mobile_lakalantas);

module.exports = router;
