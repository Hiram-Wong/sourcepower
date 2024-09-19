const express = require("express");

const { knex } = require("../../utils/common");
const { authenticateJWT, authorizeRole } = require("../../utils/middleware");

const router = express.Router();

router.post("/info", authenticateJWT, async (req, res) => {
  const { content, content_id } = req.body;

  try {
    const response = await knex("t_comment_info")
      .insert({
        user_id: req.user.userId,
        content_id,
        content,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning(["id", "content", "content_id", "created_at", "updated_at"]);

    res.json({ code: 0, msg: "ok", data: response[0] });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.delete(
  "/info/batch",
  authenticateJWT,
  authorizeRole("admin"),
  async (req, res) => {
    const { ids } = req.body;

    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.json({
          code: -1,
          msg: "Invalid ids provided",
          data: null,
        });
      }
      await knex("t_comment_info").whereIn("id", ids).del();
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

router.delete("/info/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;

  try {
    await knex("t_comment_info").where({ id }).del().returning(["id"]);

    res.json({ code: 0, msg: "ok", data: id });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: err });
  }
});

router.get("/info", async (req, res) => {
  const { page = 1, limit = 3, content, project, email } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = knex("t_comment_info")
      .select(
        "t_comment_info.id",
        "t_comment_info.content",
        "t_comment_info.created_at",
        "t_content.name as project",
        "t_user.username",
        "t_user.email"
      )
      .leftJoin("t_user", "t_comment_info.user_id", "t_user.id")
      .leftJoin("t_content", "t_comment_info.content_id", "t_content.id")
      .orderBy("t_comment_info.id", "desc");

    let queryTotal = knex("t_comment_info").count("* as total");

    if (content) {
      query = query.where("t_comment_info.content", "like", `%${content}%`);
      queryTotal = queryTotal.where(
        "t_comment_info.content",
        "like",
        `%${content}%`
      );
    }

    if (project) {
      query = query.where("t_content.name", "like", `%${project}%`);
      queryTotal = queryTotal.where("t_content.name", "like", `%${project}%`);
    }

    if (email) {
      query = query.where({ "t_user.email": email });
      queryTotal = queryTotal.where({ "t_user.email": email });
    }

    query = query.limit(limit).offset(offset);

    const list = await query;
    const total = await queryTotal;

    res.json({
      code: 0,
      msg: "ok",
      data: {
        list,
        total: parseInt(total[0].total),
      },
    });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.get("/info/list", async (req, res) => {
  const { page = 1, limit = 10, id } = req.query;
  const offset = (page - 1) * limit;

  try {
    let list = [];
    const comments = await getComments(id, limit, offset);
    const commentsTotal = await countComments(id);

    if (comments.length > 0) {
      list = await Promise.all(
        comments.map(async (comment) => {
          const replyList = await getReplies(comment.id, 3, 0);
          const replyTotal = await countReplies(comment.id);

          return {
            comment_id: comment.id,
            created_at: comment.created_at,
            compiled_content: comment.content,
            user: {
              username: comment.username,
              email: comment.email,
              id: comment.userid,
            },
            reply: replyList.map((reply) => ({
              reply_id: reply.id,
              created_at: reply.created_at,
              compiled_content: reply.content,
              user: {
                username: reply.username,
                email: reply.email,
                id: reply.userid,
              },
              to: {
                username: reply.to_username,
                email: reply.to_email,
                id: reply.to_userid,
              },
            })),
            reply_count: parseInt(replyTotal[0].total),
          };
        })
      );
    }

    res.json({
      code: 0,
      msg: "ok",
      data: {
        list,
        total: parseInt(commentsTotal[0].total),
      },
    });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.put("/info/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const existData = await knex("t_comment_info").where({ id }).select();

    if (existData.length === 0) {
      res.json({
        code: -1,
        msg: "data not found",
        data: null,
      });
      return;
    }

    const response = await knex("t_comment_info")
      .where({ id })
      .update({
        content,
        updated_at: new Date(),
      })
      .returning(["id", "content", "created_at", "updated_at"]);

    res.json({ code: 0, msg: "ok", data: response[0] });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.get("/info/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;

  try {
    const existData = await knex("t_comment_info").where({ id }).select();

    if (existData.length === 0) {
      res.json({
        code: -1,
        msg: "data not found",
        data: null,
      });
      return;
    }

    const response = await knex("t_comment_info")
      .select(
        "t_comment_info.id",
        "t_comment_info.content",
        "t_comment_info.created_at",
        "t_comment_info.updated_at",
        "t_content.name",
        "t_user.username",
        "t_user.email"
      )
      .leftJoin("t_user", "t_comment_info.user_id", "t_user.id")
      .leftJoin("t_content", "t_comment_info.content_id", "t_user.id")
      .where({ "t_comment_info.id": id });

    res.json({ code: 0, msg: "ok", data: response[0] });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.post("/reply", authenticateJWT, async (req, res) => {
  const { content, comment_id, to_id } = req.body;

  try {
    const response = await knex("t_comment_reply")
      .insert({
        user_id: req.user.userId,
        comment_id,
        to_id,
        content,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning([
        "id",
        "content",
        "comment_id",
        "to_id",
        "created_at",
        "updated_at",
      ]);

    res.json({ code: 0, msg: "ok", data: response[0] });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.delete(
  "/reply/batch",
  authenticateJWT,
  authorizeRole("admin"),
  async (req, res) => {
    const { ids } = req.body;

    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.json({
          code: -1,
          msg: "Invalid ids provided",
          data: null,
        });
      }
      await knex("t_comment_reply").whereIn("id", ids).del();
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

router.delete("/reply/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;

  try {
    await knex("t_comment_reply").where({ id }).del().returning(["id"]);

    res.json({ code: 0, msg: "ok", data: id });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: err });
  }
});

router.get("/reply/list", async (req, res) => {
  const { page = 1, limit = 3, id } = req.query;
  const offset = (page - 1) * limit;

  try {
    const replyList = await getReplies(id, limit, offset);
    const replyTotal = await countReplies(id);

    const list = replyList.map((reply) => ({
      reply_id: reply.id,
      created_at: reply.created_at,
      compiled_content: reply.content,
      user: {
        username: reply.username,
        email: reply.email,
        id: reply.userid,
      },
      to: {
        username: reply.to_username,
        email: reply.to_email,
        id: reply.to_userid,
      },
    }));

    res.json({
      code: 0,
      msg: "ok",
      data: {
        list,
        total: parseInt(replyTotal[0].total),
      },
    });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.put("/reply/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const existData = await knex("t_comment_reply").where({ id }).select();

    if (existData.length === 0) {
      res.json({
        code: -1,
        msg: "data not found",
        data: null,
      });
      return;
    }

    const response = await knex("t_comment_reply")
      .where({ id })
      .update({
        content,
        updated_at: new Date(),
      })
      .returning(["id", "content", "created_at", "updated_at"]);

    res.json({ code: 0, msg: "ok", data: response[0] });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.get("/reply/:id", authenticateJWT, async (req, res) => {
  const { id } = req.params;

  try {
    const existData = await knex("t_comment_reply").where({ id }).select();

    if (existData.length === 0) {
      res.json({
        code: -1,
        msg: "data not found",
        data: null,
      });
      return;
    }

    const response = await knex("t_comment_reply")
      .select(
        "t_comment_reply.id",
        "t_comment_reply.content",
        "t_comment_reply.created_at",
        "t_comment_reply.updated_at",
        "t_content.name",
        "t_user.username",
        "t_user.email"
      )
      .leftJoin("t_user", "t_comment_reply.user_id", "t_user.id")
      .leftJoin("t_content", "t_comment_info.content_id", "t_user.id")
      .where({ "t_comment_info.id": id });

    res.json({ code: 0, msg: "ok", data: response[0] });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

async function getComments(id, limit, offset) {
  return knex("t_comment_info")
    .select(
      "t_comment_info.id",
      "t_comment_info.content",
      "t_comment_info.created_at",
      "t_user.username",
      "t_user.email",
      "t_user.id as userid"
    )
    .leftJoin("t_user", "t_comment_info.user_id", "t_user.id")
    .where({ "t_comment_info.content_id": id })
    .orderBy("t_comment_info.id", "desc")
    .limit(limit)
    .offset(offset);
}

async function countComments(id) {
  return knex("t_comment_info").where({ content_id: id }).count("* as total");
}

async function getReplies(comment_id, limit, offset) {
  return knex("t_comment_reply")
    .select(
      "t_comment_reply.id",
      "t_comment_reply.content",
      "t_comment_reply.created_at",
      "t_user.username",
      "t_user.email",
      "t_user.id as userid",
      "t_to_user.username as to_username",
      "t_to_user.email as to_email",
      "t_to_user.id as to_userid"
    )
    .leftJoin("t_user", "t_comment_reply.user_id", "t_user.id")
    .leftJoin("t_user as t_to_user", "t_comment_reply.to_id", "t_to_user.id")
    .where({ comment_id })
    .orderBy("t_comment_reply.id", "desc")
    .limit(limit)
    .offset(offset);
}

async function countReplies(comment_id) {
  return knex("t_comment_reply").where({ comment_id }).count("* as total");
}

module.exports = router;
