const express = require("express");
const bcrypt = require("bcryptjs");

const { CONFIG, knex, redis, transporter } = require("../../utils/common");
const { cySign } = require("../../utils/tool");
const {
  authenticateJWT,
  authorizeRole,
  generateToken,
  authenticateVerify,
} = require("../../utils/middleware");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const existUser = await knex("t_user").where({ email }).select();

    if (existUser.length === 0) {
      res.json({
        code: -1,
        msg: "Email account not found",
        data: null,
      });
      return;
    }

    const user = existUser[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.json({ code: -1, msg: "incorrect password", data: null });
    }

    const token = generateToken(user);

    res.json({
      code: 0,
      msg: "ok",
      data: {
        token,
        user: {
          id: user.id,
          name: user.username,
          email: user.email,
          roles: user.role.split(","),
        },
      },
    });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.post("/register", async (req, res) => {
  const { username, email, password, code } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const existUser = await knex("t_user").where({ email }).select();

    if (existUser.length > 0) {
      res.json({
        code: -1,
        msg: "Email account has been registered",
        data: null,
      });
      return;
    }

    const ttl = await redis.ttl(email);
    if (ttl === -1) {
      res.json({
        code: -1,
        msg: "Email verification code has expired",
        data: null,
      });
      return;
    }
    const redisCode = await redis.get(email);
    if (!redisCode || redisCode !== `${code}`) {
      res.json({
        code: -1,
        msg: "Email verification code is incorrect",
        data: null,
      });
      return;
    }

    const user = await knex("t_user")
      .insert({
        username,
        email,
        password: hashedPassword,
        role: "user",
      })
      .returning(["id", "username", "email"]);
    await redis.del(email);

    res.json({ code: 0, msg: "ok", data: user[0] });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email, password, code } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const existUser = await knex("t_user").where({ email }).select();

    if (existUser.length === 0) {
      res.json({
        code: -1,
        msg: "Email account not found",
        data: null,
      });
      return;
    }

    const ttl = await redis.ttl(email);
    if (ttl === -1) {
      return res.json({
        code: -1,
        msg: "Email verification code has expired",
        data: null,
      });
    }
    const redisCode = await redis.get(email);
    if (!redisCode || redisCode !== `${code}`) {
      return res.json({
        code: -1,
        msg: "Email verification code is incorrect",
        data: null,
      });
    }

    const user = await knex("t_user")
      .where("email", "=", email)
      .update({
        password: hashedPassword,
      })
      .returning(["id", "username", "email"]);
    await redis.del(email);

    res.json({ code: 0, msg: "ok", data: user[0] });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.post("/verify-email", async (req, res) => {
  const { email } = req.body;

  try {
    const code = Math.floor(1000 + Math.random() * 9000);
    await redis.setex(email, 60 * 5, code);

    const mailOptions = {
      from: CONFIG.email.user,
      to: email,
      subject: "源动力-登录注册",
      html: `<p>您的验证码是: <strong>${code}</strong>, 有效期为5分钟。</p>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        res.json({ code: -1, msg: "send to email for code fail", data: err });
      } else {
        res.json({ code: 0, msg: "ok", data: info.response });
      }
    });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: err });
  }
});

router.get("/info", authenticateJWT, async (req, res) => {
  const id = req.user.userId;
  try {
    const user = await knex("t_user").where({ id }).select();
    if (user.length === 1) {
      const userInfo = user[0];
      res.json({
        code: 0,
        msg: "ok",
        data: {
          id: userInfo.id,
          name: userInfo.username,
          email: userInfo.email,
          roles: userInfo.role.split(","),
        },
      });
    } else {
      res.json({ code: -1, msg: "User not found", data: null });
    }
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.post("/", authenticateJWT, authorizeRole("admin"), async (req, res) => {
  const { username, password, email, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const existUser = await knex("t_user").where({ email }).select();

    if (existUser.length > 0) {
      res.json({
        code: -1,
        msg: "Email account has been registered",
        data: null,
      });
      return;
    }

    const user = await knex("t_user")
      .insert({
        username,
        email,
        password: hashedPassword,
        role,
      })
      .returning(["id", "username", "email"]);

    res.json({ code: 0, msg: "ok", data: user[0] });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.delete(
  "/batch",
  authenticateJWT,
  authorizeRole("admin"),
  async (req, res) => {
    const { userIds } = req.body;

    try {
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.json({
          code: -1,
          msg: "Invalid user IDs provided",
          data: null,
        });
      }
      await knex("t_user").whereIn("id", userIds).del();
      res.json({
        code: 0,
        msg: "ok",
        data: userIds,
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
      await knex("t_user")
        .where({ id })
        .del()
        .returning(["id", "username", "email"]);

      res.json({ code: 0, msg: "ok", data: id });
    } catch (err) {
      res.json({ code: -1, msg: err.message, data: err });
    }
  }
);

router.put("/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const existUser = await knex("t_user").where({ id }).select();

    if (existUser.length === 0) {
      res.json({
        code: -1,
        msg: "Email account not found",
        data: null,
      });
      return;
    }

    const user = await knex("t_user")
      .where({ id })
      .update({
        password: hashedPassword,
      })
      .returning(["id", "username", "email"]);

    res.json({ code: 0, msg: "ok", data: user[0] });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.get(
  "/yzm",
  authenticateJWT,
  authorizeRole("admin"),
  async (req, res) => {
    const email = req.query.email;

    try {
      const ttl = await redis.ttl(email);
      if (ttl === -1) {
        return res.json({
          code: -1,
          msg: "Email verification code has expired",
          data: null,
        });
      }

      const redisCode = await redis.get(email);
      if (!redisCode) {
        return res.json({
          code: -1,
          msg: "Email verification code is incorrect",
          data: null,
        });
      }

      res.json({ code: 0, msg: "ok", data: { code: redisCode } });
    } catch (err) {
      res.json({ code: -1, msg: err.message, data: null });
    }
  }
);

router.get("/", authenticateJWT, authorizeRole("admin"), async (req, res) => {
  const { page = 1, limit = 10, keyword } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = knex("t_user")
      .select("id", "username", "email", "role")
      .orderBy("id", "desc");
    let queryTotal = knex("t_user").count("* as total");

    if (keyword) {
      query = query.where("email", "like", `%${keyword}%`);
      queryTotal = queryTotal.where("email", "like", `%${keyword}%`);
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

router.get("/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await knex("t_user").where({ id }).select();
    if (user.length === 1) {
      const userInfo = user[0];
      res.json({
        code: 0,
        msg: "ok",
        data: {
          id: userInfo.id,
          name: userInfo.username,
          email: userInfo.email,
          roles: userInfo.role.split(","),
        },
      });
    } else {
      res.json({ code: -1, msg: "User not found", data: null });
    }
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.post("/refresh_token", authenticateJWT, async (req, res) => {
  const { userId } = req.user;

  try {
    const user = await knex("t_user").where({ id: userId }).select();

    const userInfo = user[0];

    const token = generateToken(userInfo);

    res.json({
      code: 0,
      msg: "ok",
      data: {
        token,
        user: {
          id: userInfo.id,
          name: userInfo.username,
          email: userInfo.email,
          roles: userInfo.role.split(","),
        },
      },
    });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.get("/cy/info", async (req, res) => {
  const token = req.cookies?.token;
  const _callback = req.query.callback;

  if (!token) {
    res.send(_callback + `(${JSON.stringify({ is_login: 0 })})`);
    return;
  }

  try {
    const userInfoDecoded = authenticateVerify(token);

    const response = {
      is_login: 1,
      user: {
        img_url: "http://s1.bdstatic.com/r/www/cache/xmas2012/images/car.png",
        nickname: userInfoDecoded.userName,
        profile_url: "https://zysub.catni.cn",
        user_id: userInfoDecoded.userId,
        sign: cySign(
          "16bd0e2533092b96e3e55958ef19d08a",
          "http://s1.bdstatic.com/r/www/cache/xmas2012/images/car.png",
          userInfoDecoded.userName,
          "https://zysub.catni.cn",
          userInfoDecoded.userId
        ),
      },
    };

    res.send(_callback + `(${JSON.stringify(response)})`);
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.get("/cy/logout", async (req, res) => {
  const _callback = req.query.callback;

  try {
    const response = {
      code: 1,
      reload_page: 0,
      js_src: [],
    };

    res.type("text/javascript");
    res.send(_callback + `(${JSON.stringify(response)})`);
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

module.exports = router;
