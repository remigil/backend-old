const router = require("express").Router();
const { body } = require("express-validator");
const CountTripOn = require("../controller/count_tripOn");
const formValidation = require("../middleware/form_validation");
router.get("/jenis_kendaraan", CountTripOn.get_type);
router.get("/prov_tripon", CountTripOn.prov_tripon);


module.exports = router;
