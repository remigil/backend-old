const router = require("express").Router();
const { body } = require("express-validator");
const Passenger_trip_onController = require("../controller/passenger_trip_on");
const formValidation = require("../middleware/form_validation");
router.get("/", Passenger_trip_onController.get);
router.post(
  "/add",
  body("id_society").notEmpty().isLength({ min: 3 }),
  formValidation,
  Passenger_trip_onController.add
);
router.put("/edit/:id", Passenger_trip_onController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  Passenger_trip_onController.delete
);
router.delete(
  "/hardDelete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  Passenger_trip_onController.hardDelete
);

module.exports = router;
