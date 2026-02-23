const express = require("express");
const router = express.Router();

const defectsController = require("../controllers/defects.controller");

router.get("/", defectsController.getAll);
router.post("/", defectsController.create);
router.put("/:id", defectsController.update);

module.exports = router;