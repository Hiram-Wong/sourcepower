const express = require("express");

const request = require("../../utils/request");
const { knex } = require("../../utils/common");
const { authenticateJWT, authorizeRole } = require("../../utils/middleware");


const router = express.Router();

router.get("/search", async (req, res) => {
  const { keyword, page = 1 } = req.query;

  try {
    const response = await knex("t_system")
      .select("value")
      .where("t_system.key", "cms");
      
    const cmsApi = response[0].value;
    if (!cmsApi) {
      res.json({
        code: -1,
        msg: "未配置CMS接口",
        data: null,
      });
      return;
    };
    
    const searchRespone = await request({
      url: cmsApi,
      params: {
        ac: 'list',
        wd: encodeURIComponent(keyword),
        pg: page
      },
      method: "GET",
      timeout: 5000,
    });
    
    res.json({
      code: 0,
      msg: "ok",
      data: {
        page: searchRespone.page,
        pagecount: searchRespone.pagecount,
        limit: searchRespone.limit,
        total: searchRespone.total,
        list: searchRespone.list,
      },
    });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.get("/detail/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    const dbResponse = await knex("t_system")
      .select("value")
      .where("t_system.key", "cms");
      
    const cmsApi = dbResponse[0].value;
    if (!cmsApi) {
      res.json({
        code: -1,
        msg: "未配置CMS接口",
        data: null,
      });
      return;
    };

    const detailRespone = await request({
      url: cmsApi,
      params: {
        ac: 'detail',
        ids: id
      },
      method: "GET",
      timeout: 5000,
    });

    res.json({
      code: 0,
      msg: "ok",
      data: detailRespone.list[0],
    });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.get("/api", authenticateJWT, authorizeRole("admin"), async (req, res) => {
  try {
    const response = await knex("t_system")
      .select("value")
      .where("t_system.key", "cms");

    res.json({
      code: 0,
      msg: "ok",
      data: response[0].value,
    });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

router.put("/api", authenticateJWT, authorizeRole("admin"), async (req, res) => {
  const { value } = req.body;

  try {
    const response = await knex("t_system")
      .where("t_system.key", "cms")
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

router.get("/hot/:hotType", async (req, res) => {
  const { hotType } = req.params;
  const { date, type, plat } = req.query;
  
  try {
    let response;
    if (hotType === 'ky') {
      response = await kyLiveHot(date, type, plat);
    };
    
    res.json({
      code: 0,
      msg: "ok",
      data: response,
    });
  } catch (err) {
    res.json({ code: -1, msg: err.message, data: null });
  }
});

const kyLiveHot = async (date, type, plat) => {
  const url = `https://www.ky.live/api/fullhot?vt=${type}&sd=${date}&plt=${plat}`;
  const response = await request({
    url,
    method: 'GET',
  });

  const data = response.status ? response.data : [];
  return data
    ? data.map((item) => ({
        vod_id: item.caid,
        vod_name: item.epg,
        vod_hot: item.hot,
      })).slice(0, 10)
    : [];
};

module.exports = router;
