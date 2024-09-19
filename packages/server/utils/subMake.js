/**
 * 注入参数
 * dataList 数据
**/

const dbList = (dataList) => {
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

  let js_api = (type) => {
    if (type === 0) return "./drpy_libs/drpy2.min.js";
    else if (type === 1) return "csp_XBPQ";
  };

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
    const ext = item.ext ? JSON.parse(item.ext) : {};

    if (item.type === "site") {
      data.sites.push({
        key: item.name,
        name: item.name,
        type: 3,
        api: ext?.type ? js_api(ext.type) : js_api(0),
        searchable: 1,
        quickSearch: 1,
        filterable: 1,
        ext: item.data,
      });
    } else if (item.type === "parse") {
      data.parses.push({
        name: item.name,
        url: item.data,
        type: ext?.type ? ext.type : 0,
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
  const data = dbList(dataList);
  return data;
}
