const express = require("express");

const content = require("./content");
const friendchain = require("./friendchain");
const manage = require("./manage");
const user = require("./user");
const subscribe = require("./subscribe");
const system = require("./system");

const router = express.Router();

router.use("/content", content);
router.use("/manage", manage);
router.use("/user", user);
router.use("/subscribe", subscribe);
router.use("/system", system);
router.use("/friendchain", friendchain);

module.exports = router;