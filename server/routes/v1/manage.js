const express = require("express");
const fs = require("fs");
const path = require("path");

const { knex, upload, userFileUpload } = require("../../utils/common");
const { authenticateJWT, authorizeRole } = require("../../utils/middleware");
const { readFile, updateFile, unzipFile } = require("../../utils/tool");
const subMake = require("../../utils/subMake");

const router = express.Router();

router.get(
  "/make",
  authenticateJWT,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      await subMake();

      res.json({
        code: 0,
        msg: "ok",
        // data: JSON.parse(response),
      });
    } catch (err) {
      res.json({ code: -1, msg: err.message, data: null });
    }
  }
);

router.get(
  "/main",
  authenticateJWT,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const BASE_PATH = path.join(__dirname, "../../utils/");

      let content = await readFile(path.join(BASE_PATH, "subMake.js"));

      res.json({
        code: 0,
        msg: "ok",
        data: content,
      });
    } catch (err) {
      res.json({ code: -1, msg: err.message, data: null });
    }
  }
);

router.get(
  "/migration",
  async (req, res) => {
    try {
      // 遍历目录
      const directoryPath = path.join(
        __dirname,
        "../../public/subscribe/drpy_dzlive/drpy_js/"
      );

      fs.readdir(directoryPath, (err, files) => {
        if (err) {
          console.error("Error reading directory", err);
          return;
        }

        files.forEach(async(file) => {
          if (path.extname(file) === ".js") {
            await knex("t_content").insert({
              name: path.parse(file).name,
              type: 'site',
              sensitive: file.includes("密") ? true : false,
              data: `./${file}`,
              desc: '',
              audit: 0,
              ext: '',
              created_at: new Date(),
              updated_at: new Date(),
            });
          }
        });
      });
      res.json({ code: 0, msg: 'ok', data: null });
    } catch (err) {
      res.json({ code: -1, msg: err.message, data: null });
    }
  }
);

router.put(
  "/main",
  authenticateJWT,
  authorizeRole("admin"),
  async (req, res) => {
    const content = req.body;

    try {
      const BASE_PATH = path.join(__dirname, "../../utils/");

      let data = await updateFile(path.join(BASE_PATH, "subMake.js"), content);

      res.json({
        code: 0,
        msg: "ok",
        data: null,
      });
    } catch (err) {
      res.json({ code: -1, msg: err.message, data: null });
    }
  }
);

module.exports = router;
