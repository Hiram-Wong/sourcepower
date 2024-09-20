const express = require("express");

const cms = require("./cms");
const content = require("./content");
const comment = require("./comment");
const friendchain = require("./friendchain");
const manage = require("./manage");
const user = require("./user");
const subscribe = require("./subscribe");
const system = require("./system");

const router = express.Router();

router.use("/cms", cms);
router.use("/content", content);
router.use("/comment", comment);
router.use("/manage", manage);
router.use("/user", user);
router.use("/subscribe", subscribe);
router.use("/system", system);
router.use("/friendchain", friendchain);

module.exports = router;