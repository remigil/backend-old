const router = require("express").Router();
const { body } = require("express-validator");
const InputOperasiBukti = require("../controller/input_operasi_bukti");
const InputOperasiDikmaslantas = require("../controller/input_operasi_dikmaslantas");
const InputOperasiFungsiJalan = require("../controller/input_operasi_fungsi_jalan");
const InputOperasiGiatlantas = require("../controller/input_operasi_giatlantas");
const InputOperasiKendaraan = require("../controller/input_operasi_kendaraaan");
const InputOperasiMobil = require("../controller/input_operasi_langgarmobil");
const InputOperasiMotor = require("../controller/input_operasi_langgarmotor");
const InputOperasiLanggarLantas = require("../controller/input_operasi_langgarlantas");
const InputOperasiLokasiJalan = require("../controller/input_operasi_lokasi_jalan");
const InputOperasiLokasiKawasan = require("../controller/input_operasi_lokasi_kawasan");
const InputOperasiPenyebaran = require("../controller/input_operasi_penyebaran");
const InputOperasiProfesi = require("../controller/input_operasi_profesi");
const InputOperasiSim = require("../controller/input_operasi_sim");
const InputOperasiUsia = require("../controller/input_operasi_usia");
// const formValidation = require("../middleware/form_validation");
router.post("/bukti", InputOperasiBukti.add);
router.post("/dikmaslantas", InputOperasiDikmaslantas.add);
router.post("/fungsi-jalan", InputOperasiFungsiJalan.add);
router.post("/giatlantas", InputOperasiGiatlantas.add);
router.post("/kendaraan", InputOperasiKendaraan.add);
router.post("/langgar-mobil", InputOperasiMobil.add);
router.post("/langgar-motor", InputOperasiMotor.add);
router.post("/langgar-lantas", InputOperasiLanggarLantas.add);
router.post("/lokasi-jalan", InputOperasiLokasiJalan.add);
router.post("/lokasi-kawasan", InputOperasiLokasiKawasan.add);
router.post("/penyebaran", InputOperasiPenyebaran.add);
router.post("/profesi", InputOperasiProfesi.add);
router.post("/sim", InputOperasiSim.add);
router.post("/usia", InputOperasiUsia.add);

router.get("/turjagwali-grafik", InputOperasiGiatlantas.mobile_giatlantas);
router.get(
  "/pelanggaran-grafik",
  InputOperasiLanggarLantas.mobile_langgarlantas
);

router.get("/bukti/daily", InputOperasiBukti.get);
router.get("/bukti/date", InputOperasiBukti.get_by_date);

router.get("/dikmaslantas/daily", InputOperasiDikmaslantas.get);
router.get("/dikmaslantas/date", InputOperasiDikmaslantas.get_by_date);

router.get("/fungsi_jalan/daily", InputOperasiFungsiJalan.get);
router.get("/fungsi_jalan/date", InputOperasiFungsiJalan.get_by_date);

router.get("/giatlantas/daily", InputOperasiGiatlantas.get);
router.get("/giatlantas/date", InputOperasiGiatlantas.get_by_date);

router.get("/kendaraan/daily", InputOperasiKendaraan.get);
router.get("/kendaraan/date", InputOperasiKendaraan.get_by_date);

router.get("/langgarlantas/daily", InputOperasiLanggarLantas.get);
router.get("/langgarlantas/date", InputOperasiLanggarLantas.get_by_date);

router.get("/langgarmobil/daily", InputOperasiMobil.get);
router.get("/langgarmobil/date", InputOperasiMobil.get_by_date);

router.get("/langgarmotor/daily", InputOperasiMotor.get);
router.get("/langgarmotor/date", InputOperasiMotor.get_by_date);

router.get("/lokasi_jalan/daily", InputOperasiLokasiJalan.get);
router.get("/lokasi_jalan/date", InputOperasiLokasiJalan.get_by_date);

router.get("/lokasi_kawasan/daily", InputOperasiLokasiKawasan.get);
router.get("/lokasi_kawasan/date", InputOperasiLokasiKawasan.get_by_date);

router.get("/penyebaran/daily", InputOperasiPenyebaran.get);
router.get("/penyebaran/date", InputOperasiPenyebaran.get_by_date);

router.get("/profesi/daily", InputOperasiProfesi.get);
router.get("/profesi/date", InputOperasiProfesi.get_by_date);

router.get("/sim/daily", InputOperasiSim.get);
router.get("/sim/date", InputOperasiSim.get_by_date);

router.get("/usia/daily", InputOperasiUsia.get);
router.get("/usia/date", InputOperasiUsia.get_by_date);

module.exports = router;
