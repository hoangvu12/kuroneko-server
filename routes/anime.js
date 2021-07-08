const express = require("express");
const router = express.Router();

const controller = require("../controllers/anime");
const cache = require("../middlewares/cache");

router.get("/", cache(), controller.homepage);
router.get("/search", cache(), controller.search);
router.get("/:slug", cache(), controller.getVideoInfo);
router.get("/category/:category", cache(), controller.parseListFromCategory);

module.exports = router;
