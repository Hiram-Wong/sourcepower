const express = require("express");
const geoip = require("geoip-lite");
const fs = require("fs");
const path = require("path");

const { knex, upload } = require("../../utils/common");
const { authenticateJWT, authorizeRole } = require("../../utils/middleware");

const router = express.Router();

router.get("/info", async (req, res) => {
  const requestIp = req.ip;
  const requestIpInfo = geoip.lookup(requestIp);
  const requestFinger = req.fingerprint;

  try {
    res.json({
      code: 0,
      msg: "ok",
      data: {
        ip: requestIp,
        address: requestIpInfo,
        finger: requestFinger,
      },
    });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.get("/notice", async (req, res) => {
  try {
    const response = await knex("t_system")
      .select("value")
      .where("t_system.key", "notice");

    res.json({
      code: 0,
      msg: "ok",
      data: response[0].value,
    });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.get("/donate", async (req, res) => {
  try {
    const response = await knex("t_system")
      .select("value")
      .where("t_system.key", "donate");

    res.json({
      code: 0,
      msg: "ok",
      data: response[0].value,
    });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.put("/notice", authenticateJWT, authorizeRole("admin"), async (req, res) => {
  const { value } = req.body;

  try {
    const response = await knex("t_system")
      .where("t_system.key", "notice")
      .update({
        value,
      })
      .returning(["id", "key", "value"]);

    res.json({
      code: 0,
      msg: "ok",
      data: response[0],
    });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.get(
  "/make",
  authenticateJWT,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const pathLib = {
        join: path.join,
        dirname: path.dirname,
        readDir: fs.readdirSync,
        readFile: fs.readFileSync,
        stat: fs.statSync,
      };

      const filePath = path.join(
        __dirname,
        `../../public/subscribe/drpy_dzlive/index.js`
      );

      const fileExists = fs.statSync(filePath);

      if (!fileExists.isFile()) {
        res.json({ code: -1, msg: "File does not exist", data: null });
        return;
      }

      const content = fs.readFileSync(filePath, "utf8");

      const path_dir = path.dirname(filePath);

      const func = new Function(
        "pathLib",
        "path_dir",
        `${content}\n return main;`
      );

      const response = await func(pathLib, path_dir)();

      fs.writeFileSync(
        filePath.replace("index.js", "index.json"),
        response,
        "utf-8"
      );

      res.json({
        code: 0,
        msg: "ok",
        data: JSON.parse(response),
      });
    } catch (err) {
      res.json({ code: -1, msg: err.message, data: null });
    }
  }
);

router.post("/upload", authenticateJWT, upload.single("file"), async (req, res) => {
  const { filename } = req.file;

  try {
    res.json({
      code: 0,
      msg: "ok",
      data: {
        filename,
        url: `./${filename}`,
      },
    });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

module.exports = router;
