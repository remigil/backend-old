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
router.post("/usia-pelaku", InputOperasiUsiaPelaku.add);

router.get("/kecelakaan-grafik", InputOperasiLakalantas.mobile_lakalantas);

router.get("/lakalantas/daily", InputOperasiLakalantas.get);
router.get("/lakalantas/date", InputOperasiLakalantas.get_by_date);

router.get("/lakaranmor/daily", InputOperasiLakaRanmor.get);
router.get("/lakaranmor/date", InputOperasiLakaRanmor.get_by_date);

router.get("/pekerjaan_korban/daily", InputOperasiPekerjaanKorban.get);
router.get("/pekerjaan_korban/date", InputOperasiPekerjaanKorban.get_by_date);

router.get("/pekerjaan_pelaku/daily", InputOperasiPekerjaanPelaku.get);
router.get("/pekerjaan_pelaku/date", InputOperasiPekerjaanPelaku.get_by_date);

router.get("/pendidikan_korban/daily", InputOperasiPendidikanKorban.get);
router.get("/pendidikan_korban/date", InputOperasiPendidikanKorban.get_by_date);

router.get("/usia_korban/daily", InputOperasiUsiaKorban.get);
router.get("/usia_korban/date", InputOperasiUsiaKorban.get_by_date);

router.get("/usia_pelaku/daily", InputOperasiUsiaPelaku.get);
router.get("/usia_pelaku/date", InputOperasiUsiaPelaku.get_by_date);

module.exports = router;
