const express = require("express");
const fs = require("fs");
const path = require("path");

const { knex } = require("../../utils/common");
const { authenticateJWT, authorizeRole } = require("../../utils/middleware");

const router = express.Router();

router.get("/all", async (req, res) => {
  const {
    page = 1,
    limit = 12,
    creator,
    keyword,
    sensitive,
    type,
  } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = knex("t_content");
    let queryTotal = knex("t_content");

    query = query
      .select(
        "t_content.id",
        "t_content.name",
        "t_content.type",
        "t_content.sensitive",
        "t_content.data",
        "t_content.desc",
        "t_content.audit",
        "t_content.ext",
        "t_content.created_at",
        "t_content.updated_at",
        "t_user.username",
        "t_user.email"
      )
      .leftJoin("t_user", "t_content.user_id", "t_user.id");
    queryTotal = queryTotal.count("* as total");

    query = query.where("audit", 0);
    queryTotal = queryTotal.where("audit", 0);

      console.log(typeof creator,creator)
      if (creator) {
      query = query.where({user_id: creator});
      queryTotal = queryTotal.where({user_id: creator});
    }

    if (keyword) {
      query = query.where("name", "like", `%${keyword}%`);
      queryTotal = queryTotal.where("name", "like", `%${keyword}%`);
    }

    if (sensitive) {
      query = query.where({ sensitive: sensitive === "sensitive" ? true : false });
      queryTotal = queryTotal.where({ sensitive: sensitive === "sensitive" ? true : false });
    }

    if (type) {
      query = query.where({ type });
      queryTotal = queryTotal.where({ type });
    }

    const dataList = await query
      .limit(limit)
      .offset(offset)
      .orderBy("id", "desc");
    const dataTotal = await queryTotal;

    res.json({
      code: 0,
      msg: "ok",
      data: {
        list: dataList,
        total: parseInt(dataTotal[0].total),
      },
    });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.get("/rank", async (req, res) => {
  try {
    let list = await knex("t_content")
      .select("t_user.id", "t_user.username", "t_user.email", knex.raw("count(*) as count"))
      .where("t_content.audit", 0)
      .leftJoin("t_user", "t_content.user_id", "t_user.id")
      .groupBy("t_user.id")
      .orderBy("count", "desc")
      .limit(10);

    res.json({
      code: 0,
      msg: "ok",
      data: {
        list: list,
        total: list.length,
      },
    });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.get("/creator", async (req, res) => {
  try {
    let list = await knex("t_content")
      .select("t_user.id", "t_user.username", "t_user.email")
      .where("t_content.audit", 0)
      .leftJoin("t_user", "t_content.user_id", "t_user.id")
      .groupBy("t_user.id")
      .orderBy("t_user.id", "desc");

    res.json({
      code: 0,
      msg: "ok",
      data: {
        list: list,
        total: list.length,
      },
    });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.get("/history", authenticateJWT, async (req, res) => {
  const { page = 1, pageSize = 12 } = req.query;
  const offset = (page - 1) * pageSize;

  try {
    let query = knex("t_content");
    let queryTotal = knex("t_content");

    query = query.select(
      "id",
      "name",
      "type",
      "sensitive",
      "data",
      "desc",
      "audit",
      "ext",
      "created_at",
      "updated_at"
    );
    queryTotal = queryTotal.count("* as total");

    query = query.where({ user_id: req.user.userId });
    queryTotal = queryTotal.where({ user_id: req.user.userId });

    const dataList = await query
      .limit(pageSize)
      .offset(offset)
      .orderBy("id", "desc");
    const dataTotal = await queryTotal;

    res.json({
      code: 0,
      msg: "ok",
      data: {
        list: dataList,
        total: parseInt(dataTotal[0].total),
      },
    });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.post("/", authenticateJWT, async (req, res) => {
  const {
    name = "",
    type = "",
    sensitive = false,
    data = "",
    desc = "",
    audit = -1,
    ext = "",
  } = req.body;

  try {
    const response = await knex("t_content")
      .insert({
        name,
        user_id: req.user.userId,
        type,
        sensitive,
        data,
        desc,
        audit,
        ext: ext,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning([
        "id",
        "name",
        "type",
        "sensitive",
        "data",
        "desc",
        "audit",
        "ext",
        "created_at",
        "updated_at",
      ]);

    res.json({ code: 0, msg: "ok", data: response[0] });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.delete(
  "/batch",
  authenticateJWT,
  authorizeRole("admin"),
  async (req, res) => {
    const { ids } = req.body;

    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.json({
          code: -1,
          msg: "Invalid user IDs provided",
          data: null,
        });
      }
      await knex("t_content").whereIn("id", ids).del();
      res.json({
        code: 0,
        msg: "ok",
        data: ids,
      });
    } catch (err) {
      res.json({
        code: -1,
        msg: err.message,
        data: null,
      });
    }
  }
);

router.delete(
  "/:id",
  authenticateJWT,
  authorizeRole("admin"),
  async (req, res) => {
    const { id } = req.params;

    try {
      await knex("t_content").where({ id }).del().returning(["id", "name"]);

      res.json({ code: 0, msg: "ok", data: id });
    } catch (err) {
      res.json({ code: -1, msg: err.message, data: err });
    }
  }
);

router.put("/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { name, type, sensitive, data, desc, audit = -1, ext = {} } = req.body;

  try {
    const existData = await knex("t_content").where({ id }).select();

    if (existData.length === 0) {
      res.json({
        code: -1,
        msg: "data not found",
        data: null,
      });
      return;
    }

    const response = await knex("t_content")
      .where({ id })
      .update({
        name,
        type,
        sensitive,
        data,
        desc,
        audit,
        ext,
        updated_at: new Date(),
      })
      .returning([
        "id",
        "name",
        "type",
        "sensitive",
        "data",
        "desc",
        "audit",
        "ext",
        "created_at",
        "updated_at",
      ]);

    if (!response[0].data.startsWith("http")) {
      if (audit !== -1 && existData[0].audit !== audit) {
        const data_path = response[0].data;
        if (response[0].audit === 0) {
          fs.copyFileSync(
            path.join(__dirname, "../../public/upload/", data_path),
            path.join(
              __dirname,
              "../../public/subscribe/drpy_dzlive/drpy_js/",
              data_path
            )
          );
        } else if (response[0].audit === -2) {
          fs.unlinkSync(
            path.join(
              __dirname,
              "../../public/subscribe/drpy_dzlive/drpy_js/",
              data_path
            )
          );
        }
      }
    }

    res.json({ code: 0, msg: "ok", data: response[0] });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.get("/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;

  try {
    const response = await knex("t_content")
      .select(
        "t_content.id",
        "t_content.name",
        "t_content.type",
        "t_content.sensitive",
        "t_content.data",
        "t_content.desc",
        "t_content.audit",
        "t_content.ext",
        "t_content.created_at",
        "t_content.updated_at",
        "t_user.username",
        "t_user.email"
      )
      .leftJoin("t_user", "t_content.user_id", "t_user.id")
      .where({ "t_content.id": id })
      .orderBy("t_content.id", "desc");

    if (response.length === 0) {
      res.json({
        code: -1,
        msg: "data not found",
        data: null,
      });
      return;
    }

    const data = response[0];
    const BASE_PATH = path.join(
      __dirname,
      "../../public/subscribe/drpy_dzlive/"
    );

    if (!data.data.startsWith("http")) {
      let readData = fs.readFileSync(
        path.join(BASE_PATH, "drpy_js/", data.data),
        "utf8"
      );

      data.content = readData;
    }

    res.json({ code: 0, msg: "ok", data: response[0] });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.get("/", authenticateJWT, authorizeRole("admin"), async (req, res) => {
  const {
    page = 1,
    limit = 10,
    audit = 1,
    keyword,
    creator,
    type,
    sensitive,
  } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = knex("t_content")
      .select(
        "t_content.id",
        "t_content.name",
        "t_content.type",
        "t_content.sensitive",
        "t_content.data",
        "t_content.desc",
        "t_content.audit",
        "t_content.ext",
        "t_content.created_at",
        "t_content.updated_at",
        "t_user.username",
        "t_user.email"
      )
      .leftJoin("t_user", "t_content.user_id", "t_user.id")
      .orderBy("t_content.id", "desc");
    let queryTotal = knex("t_content").count("* as total");

    if (creator) {
      console.log(typeof creator,creator)
      query = query.where({"user_id": parseInt(creator)});
      queryTotal = queryTotal.where({"user_id": parseInt(creator)});
    }

    if (keyword) {
      query = query.where("name", "like", `%${keyword}%`);
      queryTotal = queryTotal.where("name", "like", `%${keyword}%`);
    }

    if (type) {
      query = query.where({ type });
      queryTotal = queryTotal.where({ type });
    }

    if (parseInt(audit) !== 1) {
      query = query.where({ audit });
      queryTotal = queryTotal.where({ audit });
    }

    if (sensitive) {
      query = query.where({ sensitive: sensitive === "sensitive" ? true : false });
      queryTotal = queryTotal.where({ sensitive: sensitive === "sensitive" ? true : false });
    }

    query = query.limit(limit).offset(offset);

    const list = await query;
    const total = await queryTotal;

    res.json({
      code: 0,
      msg: "ok",
      data: {
        list: list,
        total: parseInt(total[0].total),
      },
    });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

module.exports = router;
