const { knex } = require("./common");
const fs = require("fs");
const path = require("path");

const dbList = async (type = "all") => {
  let query = knex("t_content").where("audit", 0);
  if (type !== "all") {
    query.where("sensitive", type === "sensitive" ? true : false);
  }
  console.log(query)

  const dataList = await query.orderBy("id", "desc");

  let data = {
    wallpaper: "https://tuapi.eees.cc/api.php?category=fengjing&type=302",
    homepage: "https://zysub.catni.cn",
    homeLogo: "./img/logo500x200-1.png",
    spider: "./jar/pg.jar?md5=7633f8ea346c082b7aa163be58aed023",
    flags: [
      "imgo",
      "youku",
      "qq",
      "qq 预告及花絮",
      "iqiyi",
      "qiyi",
      "fun",
      "letv",
      "leshi",
      "sohu",
      "tudou",
      "xigua",
      "cntv",
      "1905",
      "pptv",
      "mgtv",
      "wasu",
      "bilibili",
      "renrenmi",
    ],
    sites: [],
    parses: [],
    live: [
      {
        group: "redirect",
        channels: [],
      },
    ],
  };
  let js_api = "./drpy_libs/drpy2.min.js";
  let parse_flag = [
    "qiyi",
    "imgo",
    "爱奇艺",
    "奇艺",
    "qq",
    "qq 预告及花絮",
    "腾讯",
    "youku",
    "优酷",
    "pptv",
    "PPTV",
    "letv",
    "乐视",
    "leshi",
    "mgtv",
    "芒果",
    "sohu",
    "xigua",
    "fun",
    "风行",
  ];
  dataList.forEach((item) => {
    if (item.type === "site") {
      data.sites.push({
        key: item.name,
        name: item.name,
        type: 3,
        api: js_api,
        searchable: 1,
        quickSearch: 1,
        filterable: 1,
        ext: item.data,
      });
    } else if (item.type === "parse") {
      const ext = item.ext;
      let type = 0;
      if (ext.type) type = ext.type;
      data.parses.push({
        name: item.name,
        url: item.data,
        type: type,
        ext: {
          flag: parse_flag,
        },
        header: {
          "User-Agent": "Mozilla/5.0",
        },
      });
    } else if (item.type === "live") {
      data.live[0].channels.push({
        name: item.name,
        urls: [`proxy://do=live&type=txt&ext=${item.data}`],
      });
    }
  });

  return data;
};

async function main() {
  const BASE_PATH = path.join(
    __dirname,
    "../public/subscribe/"
  );

  ["all", "sensitive" , "nosensitive"].forEach(async(item) => {
    const data = await dbList(item);
    const data_to_str = JSON.stringify(data);
    fs.writeFileSync(path.join(BASE_PATH, `./${item}.json`), data_to_str, "utf-8");
  })
}

module.exports = main;
