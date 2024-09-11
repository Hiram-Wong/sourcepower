const express = require("express");
const moment = require("moment");
const path = require("path");
const fs = require("fs");

const generateShortCode = require("../../utils/shortCode");
const { knex } = require("../../utils/common");
const {
  authenticateJWT,
  authorizeRole,
  limiter,
} = require("../../utils/middleware");

const router = express.Router();

const validateCode = async (req, res, next) => {
  const { code } = req.params;
  const requestIP = req.ip;

  const link = await knex("t_subscribe").where({
    code,
  });

  if (link.length === 0) {
    return res.json({ code: -1, msg: "Subscription not found", data: null });
  }

  const linkInfo = link[0];
  const allowedIPs = linkInfo.allow_ips ? linkInfo.allow_ips.split(",") : [];

  if (!allowedIPs.includes(requestIP)) {
    return res.json({
      code: -1,
      msg: "Your IP is not allowed to access this subscription",
      data: {
        ip: requestIP,
      },
    });
  }
  next(); // 校验通过，继续后续处理
};

router.get("/code", authenticateJWT, async (req, res) => {
  try {
    const code = generateShortCode(req.user.userId)[0];
    res.json({ code: 0, msg: "ok", data: { code } });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});


router.post("/", authenticateJWT, async (req, res) => {
  let { allow_ips } = req.body;

  try {
    if (allow_ips.endsWith(",")) {
      allow_ips = allow_ips.slice(0, -1);
    }

    if (allow_ips.split(",").length > 5) {
      res.json({
        code: -1,
        msg: "Param allow_ips must less than five available ip",
        data: null,
      });
    }

    const subscribeInfo = await knex("t_subscribe").where({
      user_id: req.user.userId,
    });

    let code;
    if (subscribeInfo.length === 0) {
      code = generateShortCode(req.user.userId)[0];

      await knex("t_subscribe").insert({
        user_id: req.user.userId,
        allow_ips: allow_ips,
        code: code,
        created_at: new Date(),
        updated_at: new Date(),
      });
    } else {
      code = subscribeInfo[0].code;

      await knex("t_subscribe").where({ user_id: req.user.userId }).update({
        allow_ips: allow_ips,
        updated_at: new Date(),
      });
    }

    res.json({ code: 0, msg: "ok", data: { code } });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.delete(
  "/batch",
  authenticateJWT,
  authorizeRole("admin"),
  async (req, res) => {
    const { subIds } = req.body;

    try {
      if (!subIds || !Array.isArray(subIds) || subIds.length === 0) {
        return res.json({
          code: -1,
          msg: "Invalid sub Ids provided.",
          data: subIds,
        });
      }

      await knex("t_subscribe").whereIn("id", subIds).del();

      res.json({ code: 0, msg: "ok", data: subIds });
    } catch (err) {
      res.json({ code: -1, msg: err.message, data: null });
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
      await knex("t_subscribe").where({ id }).del().returning("id");

      res.json({ code: 0, msg: "ok", data: id });
    } catch (err) {
      res.json({ code: -1, msg: err.message, data: null });
    }
  }
);

router.get("/", authenticateJWT, authorizeRole("admin"), async (req, res) => {
  const { page = 1, limit = 10, keyword } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = knex("t_subscribe")
      .select(
        "t_subscribe.id",
        "t_subscribe.allow_ips",
        "t_subscribe.code",
        "t_user.username",
        "t_user.email"
      )
      .leftJoin("t_user", "t_subscribe.user_id", "t_user.id")
      .orderBy("t_subscribe.id", "desc");
    let queryTotal = knex("t_subscribe").count("* as total");

    if (keyword) {
      query = query.where("t_subscribe.code", "like", `%${keyword}%`);
      subTotal = queryTotal.where("t_subscribe.code", "like", `%${keyword}%`);
    }

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

router.put("/:id", authenticateJWT, async (req, res) => {
  let { allow_ips } = req.body;
  const { id } = req.params;

  try {
    if (allow_ips.endsWith(",")) {
      allow_ips = allow_ips.slice(0, -1);
    }

    if (allow_ips.split(",").length > 5) {
      res.json({
        code: -1,
        msg: "Param allow_ips must less than three available ip",
        data: null,
      });
    }

    const link = await knex("t_subscribe")
      .where({ id })
      .update({
        allow_ips,
        updated_at: new Date(),
      })
      .returning("code");

    res.json({ code: 0, msg: "ok", data: { code: link[0].code } });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.get("/:code/sub", limiter, async (req, res) => {
  const { code } = req.params;
  const { type } = req.query;

  const requestIP = req.ip;

  if (!(type === "all" || type === "sensitive" || type === "nosensitive")) {
    return res.json({
      code: -1,
      msg: "type not exist",
      data: null,
    });
  }

  try {
    const link = await knex("t_subscribe").where({ code }).select();

    if (link.length === 0) {
      return res.json({ code: -1, msg: "Subscription not found", data: null });
    }

    const linkInfo = link[0];
    const allowedIPs = linkInfo.allow_ips ? linkInfo.allow_ips.split(",") : [];

    if (!allowedIPs.includes(requestIP)) {
      return res.json({
        code: -1,
        msg: "Your IP is not allowed to access this subscription",
        data: {
          ip: requestIP,
        },
      });
    }

    const BASE_PATH = path.join(__dirname, "../../public/subscribe/");

    const readData = fs.readFileSync(
      path.join(BASE_PATH, `${type}.json`),
      "utf8"
    );
    const content = JSON.parse(readData);

    res.json(content);
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.use(
  "/:code/",
  validateCode,
  express.static(path.join(__dirname, "../../public/subscribe/drpy_dzlive")),
  express.static(path.join(__dirname, "../../public/subscribe/drpy_dzlive/drpy_js"))
);

module.exports = router;
