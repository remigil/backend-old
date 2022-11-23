const router = require("express").Router();
const { body } = require("express-validator");
const NtmcOnAirTV = require("../controller/input_ntmc_onairtv");
const NtmcOnAirOnline = require("../controller/input_ntmc_onaironline");
const NtmcOnAirMedsos = require("../controller/input_ntmc_onairmedsos");
const NtmcOffAirProgram = require("../controller/input_ntmc_offairprogram");
const NtmcDocMediaTV = require("../controller/input_ntmc_doctv");
const NtmcDocMedsos = require("../controller/input_ntmc_docmedsos");
const NtmcAktivitasMedsos = require("../controller/input_ntmc_aktivitasmedsos");
const NtmcAktivitasRadio = require("../controller/input_ntmc_aktivitasradio");
const NtmcAktivitasPengaduan = require("../controller/input_ntmc_aktivitaspengaduan");
const Ntmc_onair_mediaonline = require("../model/ntmc_onair_mediaonline");

router.post("/onair-tv", NtmcOnAirTV.add);
router.post("/onair-online", NtmcOnAirOnline.add);
router.post("/onair-medsos", NtmcOnAirMedsos.add);
router.post("/offair-program", NtmcOffAirProgram.add);
router.post("/dok-tv", NtmcDocMediaTV.add);
router.post("/dok-medsos", NtmcDocMedsos.add);
router.post("/aktivitas-medsos", NtmcAktivitasMedsos.add);
router.post("/aktivitas-radio", NtmcAktivitasRadio.add);
router.post("/aktivitas-pengaduan", NtmcAktivitasPengaduan.add);

router.get("/aktivitas-medsos/date", NtmcAktivitasMedsos.get_by_date);
router.get("/aktivitas-pengaduan/date", NtmcAktivitasPengaduan.get_by_date);
router.get("/aktivitas-radio/date", NtmcAktivitasRadio.get_by_date);
router.get("/dok-medsos/date", NtmcDocMedsos.get_by_date);
router.get("/dok-tv/date", NtmcDocMediaTV.get_by_date);
router.get("/offair-program/date", NtmcOffAirProgram.get_by_date);
router.get("/onair-medsos/date", NtmcOnAirMedsos.get_by_date);
router.get("/onair-online/date", NtmcOnAirOnline.get_by_date);
router.get("/onair-tv/date", NtmcOnAirTV.get_by_date);

module.exports = router;
