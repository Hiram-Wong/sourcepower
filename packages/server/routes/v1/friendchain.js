const express = require("express");

const { knex } = require("../../utils/common");
const { authenticateJWT, authorizeRole } = require("../../utils/middleware");

const router = express.Router();

router.get("/all", async (req, res) => {
  try {
    const list = await knex("t_friendchain").orderBy("id", "desc");
    const total = await knex("t_friendchain").count("* as total");

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

router.post("/", authenticateJWT, authorizeRole("admin"), async (req, res) => {
  const { name, url, logo = "" } = req.body;

  try {
    const friendchain = await knex("t_friendchain")
      .insert({
        name,
        url,
        logo,
      })
      .returning(["id", "name", "url", "logo"]);

    res.json({ code: 0, msg: "ok", data: friendchain[0] });
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
      await knex("t_friendchain").whereIn("id", ids).del();
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
      await knex("t_friendchain").where({ id }).del().returning(["id", "name"]);

      res.json({ code: 0, msg: "ok", data: id });
    } catch (err) {
      res.json({ code: -1, msg: err.message, data: err });
    }
  }
);

router.put("/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { name, url, logo } = req.body;

  try {
    const existFriendchain = await knex("t_friendchain").where({ id }).select();

    if (existFriendchain.length === 0) {
      res.json({
        code: -1,
        msg: "data not found",
        data: null,
      });
      return;
    }

    const user = await knex("t_friendchain")
      .where({ id })
      .update({
        name,
        url,
        logo,
      })
      .returning(["id", "name", "url", "logo"]);

    res.json({ code: 0, msg: "ok", data: user[0] });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.get("/", authenticateJWT, authorizeRole("admin"), async (req, res) => {
  const { page = 1, limit = 10, keyword } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = knex("t_friendchain")
      .select("id", "name", "url", "logo")
      .orderBy("id", "desc");
    let queryTotal = knex("t_friendchain").count("* as total");

    if (keyword) {
      query = query.where("name", "like", `%${keyword}%`);
      queryTotal = queryTotal.where("name", "like", `%${keyword}%`);
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
