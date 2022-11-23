const router = require("express").Router();
const { body } = require("express-validator");
const Sim_kelilingController = require("../controller/sim_keliling");
const formValidation = require("../middleware/form_validation");
router.get("/", Sim_kelilingController.get);
router.get("/getId/:id", Sim_kelilingController.getId);
router.post(
  "/add",
  // body("name_sim_keliling").notEmpty().isLength({ min: 3 }),
  formValidation,
  Sim_kelilingController.add
);
router.put("/edit/:id", Sim_kelilingController.edit);
router.delete(
  "/delete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  Sim_kelilingController.delete
);
router.delete(
  "/hardDelete",
  body("id").notEmpty().isLength({ min: 1 }),
  formValidation,
  Sim_kelilingController.hardDelete
);

module.exports = router;
