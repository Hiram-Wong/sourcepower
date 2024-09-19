const express = require("express");
const fs = require("fs");
const path = require("path");

const { knex } = require("../../utils/common");
const { authenticateJWT, authorizeRole } = require("../../utils/middleware");
const { isFile, readFile, updateFile } = require("../../utils/tool");

const router = express.Router();

router.get(
  "/make",
  authenticateJWT,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const logicPath = path.join(__dirname, "../../utils/subMake.js");

      if (isFile(logicPath)) {
        const content = await readFile(logicPath);
        const func = new Function("dataList", `${content}\n return main;`);

        ["all", "sensitive", "nosensitive"].forEach(async (item) => {
          let query = knex("t_content").where("audit", 0);
          if (item !== "all") {
            query.where("sensitive", item === "sensitive" ? true : false);
          }

          const dataList = await query.orderBy("id", "desc");

          const response = await func(dataList)();
          const data_to_str = JSON.stringify(response);

          fs.writeFileSync(
            path.join(__dirname, `../../public/subscribe/${item}.json`),
            data_to_str,
            "utf-8"
          );
        });
      }

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

router.get("/migration", async (req, res) => {
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

      files.forEach(async (file) => {
        if (path.extname(file) === ".js") {
          await knex("t_content").insert({
            name: path.parse(file).name,
            type: "site",
            sensitive: file.includes("密") ? true : false,
            data: `./${file}`,
            desc: "",
            audit: 0,
            ext: "",
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      });
    });
    res.json({ code: 0, msg: "ok", data: null });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

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
