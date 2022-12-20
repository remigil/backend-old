const router = require("express").Router();
const { body } = require("express-validator");
const StackController = require("../controller/stackholder");

const Layanan_Stackholder = require("../controller/layanan_stackholder");
const formValidation = require("../middleware/form_validation");
router.get("/", StackController.get);
router.post("/add", StackController.add);
router.get("/getId/:id", StackController.getId);
router.put("/edit/:id", StackController.edit);
router.delete("/delete", StackController.delete);
router.delete("/hardDelete", StackController.hardDelete);

router.post("/add_layanan_stackholder", Layanan_Stackholder.add);


module.exports = router;
