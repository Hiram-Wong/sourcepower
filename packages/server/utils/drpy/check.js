const { getMubans } = require("./template");

/**
 * 获取加密前的原始的js源文本
 * @param js_code
 */
function getOriginalJs(js_code) {
  let current_match =
    /var rule|[\u4E00-\u9FA5]+|function|let |var |const |\(|\)|"|'/;
  if (current_match.test(js_code)) {
    return js_code;
  }
  let decode_content = "";

  function aes_decrypt(data) {
    const key = CryptoJS.enc.Hex.parse(aes_key.key);
    const iv = CryptoJS.enc.Hex.parse(aes_key.iv);

    let encrypted = CryptoJS.AES.decrypt(
      {
        ciphertext: CryptoJS.enc.Base64.parse(data),
      },
      key,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    ).toString(CryptoJS.enc.Utf8);

    return encrypted;
  }

  let error_log = true;

  function logger(text) {
    if (error_log) {
      log(text);
    }
  }

  let decode_funcs = [
    (text) => {
      try {
        return ungzip(text);
      } catch (e) {
        logger("非gzip加密");
        return "";
      }
    },
    (text) => {
      try {
        return base64Decode(text);
      } catch (e) {
        logger("非b64加密");
        return "";
      }
    },
    (text) => {
      try {
        return aes_decrypt(text);
      } catch (e) {
        logger("非aes加密");
        return "";
      }
    },
    (text) => {
      try {
        return RSA.decode(text, rsa_private_key, null);
      } catch (e) {
        logger("非rsa加密");
        return "";
      }
    },
  ];
  let func_index = 0;
  while (!current_match.test(decode_content)) {
    decode_content = decode_funcs[func_index](js_code);
    func_index++;
    if (func_index >= decode_funcs.length) {
      break;
    }
  }
  return decode_content;
}

function encryptJs(js_code, type = null) {
  const encode_dict = {
    gzip: "gzip",
    base64: "base64",
    rsa: "rsa",
    aes: "aes",
  };

  function getRandomKey(dict) {
    const keys = Object.keys(dict);
    const randomIndex = Math.floor(Math.random() * keys.length);
    return keys[randomIndex];
  }

  let encode_method = type ? type : getRandomKey(encode_dict);

  let decode_txt = "";
  switch (encode_method) {
    case "gzip":
      decode_txt = gzip(js_code);
      break;
    case "base64":
      decode_txt = base64Encode(js_code);
      break;
    case "rsa":
      decode_txt = RSA.encode(js_code, rsa_private_key);
      break;
    case "aes":
      function aes_encrypt(data) {
        const key = CryptoJS.enc.Hex.parse(aes_key.key);
        const iv = CryptoJS.enc.Hex.parse(aes_key.iv);

        const ciphertext = CryptoJS.AES.encrypt(
          CryptoJS.enc.Utf8.parse(data),
          key,
          {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
          }
        ).toString();

        return ciphertext;
      }
      decode_txt = aes_encrypt(js_code);
      break;
  }

  return decode_txt;
}

const init = (ext) => {
  console.log("[t3]init");
  // init前重置rule和fetch_params
  rule = {};
  rule_fetch_params = {};
  fetch_params = null;
  try {
    let muban = getMubans();
    if (typeof ext == "object") rule = ext;
    else if (typeof ext == "string") {
      if (ext.startsWith("http") || ext.startsWith("file://")) {
        let query = getQuery(ext); // 获取链接传参
        let js = request(ext, { method: "GET" });
        if (js) {
          js = getOriginalJs(js);
          // eval(js.replace('var rule', 'rule'));
          // eval("(function(){'use strict';"+js.replace('var rule', 'rule')+"})()");
          eval("(function(){" + js.replace("var rule", "rule") + "})()");
        }
        if (query["type"] === "url" && query["params"]) {
          // 指定type是链接并且传了params支持简写如 ./xx.json
          rule["params"] = urljoin(ext, query["params"]);
        } else if (query["params"]) {
          // 没指定type直接视为字符串
          rule["params"] = query["params"];
        }
      } else {
        ext = getOriginalJs(ext);
        // eval(ext.replace('var rule', 'rule'));
        // eval("(function(){'use strict';"+ext.replace('var rule', 'rule')+"})()");

        eval("(function(){" + ext.replace("var rule", "rule") + "})()");
      }
    } else {
      console.log(`规则加载失败,不支持的规则类型:${typeof ext}`);
      return;
    }
    rule["host"] = (rule["host"] || "").rstrip("/");
    HOST = rule["host"];
    if (rule["hostJs"]) {
      console.log(`[t3][publish]检测到hostJs,准备执行...`);
      try {
        eval(rule["hostJs"]);
        rule["host"] = HOST.rstrip("/");
        console.log(`[t3][publish]最新域名为${rule["host"]}`);
      } catch (e) {
        console.log(
          `[t3][publish]执行${rule["hostJs"]}获取host发生错误:${e.message}`
        );
      }
    }
    if (rule["模板"] === "自动") {
      try {
        let host_headers = rule["headers"] || {};
        let host_html = getCode(HOST, { headers: host_headers });
        let match_muban = "";
        let muban_keys = Object.keys(muban).filter(
          (it) => !/默认|短视2|采集1/.test(it)
        );
        for (let muban_key of muban_keys) {
          try {
            let host_data = home({}, host_html, muban[muban_key].class_parse);
            if (host_data.class && host_data.class.length > 0) {
              match_muban = muban_key;
              console.log(`自动匹配模板:【${muban_key}】`);
              break;
            }
          } catch (e) {
            console.log(`自动匹配模板:【${muban_key}】错误:${e.message}`);
          }
        }
        if (match_muban) {
          muban["自动"] = muban[match_muban];
          if (rule["模板修改"] && rule["模板修改"].startsWith("js:")) {
            // 模板修改:$js.toString(()=>{ muban.自动.class_parse = ''});
            eval(rule["模板修改"].replace("js:", "").trim());
          }
        } else {
          delete rule["模板"];
        }
      } catch (e) {
        delete rule["模板"];
      }
    }
    if (rule["模板"] && muban.hasOwnProperty(rule["模板"])) {
      console.log(`继承模板:${rule["模板"]}`);
      rule = Object.assign(muban[rule["模板"]], rule);
    }
    /** 处理一下 rule规则关键字段没传递的情况 **/
    let rule_cate_excludes = (rule["cate_exclude"] || "")
      .split("|")
      .filter((it) => it.trim());
    let rule_tab_excludes = (rule["tab_exclude"] || "")
      .split("|")
      .filter((it) => it.trim());
    rule_cate_excludes = rule_cate_excludes.concat(
      CATE_EXCLUDE.split("|").filter((it) => it.trim())
    );
    rule_tab_excludes = rule_tab_excludes.concat(
      TAB_EXCLUDE.split("|").filter((it) => it.trim())
    );

    rule["cate_exclude"] = rule_cate_excludes.join("|");
    rule["tab_exclude"] = rule_tab_excludes.join("|");

    rule["类型"] = rule["类型"] || "影视"; // 影视|听书|漫画|小说
    rule["url"] = rule["url"] || "";
    rule["double"] = rule["double"] || false;
    rule["homeUrl"] = rule["homeUrl"] || "";
    rule["detailUrl"] = rule["detailUrl"] || "";
    rule["searchUrl"] = rule["searchUrl"] || "";
    rule["homeUrl"] =
      rule["host"] && rule["homeUrl"]
        ? urljoin(rule["host"], rule["homeUrl"])
        : rule["homeUrl"] || rule["host"];
    rule["homeUrl"] = cheerio.jinja2(rule["homeUrl"], { rule: rule });
    rule["detailUrl"] =
      rule["host"] && rule["detailUrl"]
        ? urljoin(rule["host"], rule["detailUrl"])
        : rule["detailUrl"];
    rule["二级访问前"] = rule["二级访问前"] || "";
    if (rule["url"].includes("[") && rule["url"].includes("]")) {
      let u1 = rule["url"].split("[")[0];
      let u2 = rule["url"].split("[")[1].split("]")[0];
      rule["url"] =
        rule["host"] && rule["url"]
          ? urljoin(rule["host"], u1) + "[" + urljoin(rule["host"], u2) + "]"
          : rule["url"];
    } else {
      rule["url"] =
        rule["host"] && rule["url"]
          ? urljoin(rule["host"], rule["url"])
          : rule["url"];
    }
    if (
      rule["searchUrl"].includes("[") &&
      rule["searchUrl"].includes("]") &&
      !rule["searchUrl"].includes("#")
    ) {
      let u1 = rule["searchUrl"].split("[")[0];
      let u2 = rule["searchUrl"].split("[")[1].split("]")[0];
      rule["searchUrl"] =
        rule["host"] && rule["searchUrl"]
          ? urljoin(rule["host"], u1) + "[" + urljoin(rule["host"], u2) + "]"
          : rule["searchUrl"];
    } else {
      rule["searchUrl"] =
        rule["host"] && rule["searchUrl"]
          ? urljoin(rule["host"], rule["searchUrl"])
          : rule["searchUrl"];
    }

    rule["timeout"] = rule["timeout"] || 5000;
    rule["encoding"] = rule["编码"] || rule["encoding"] || "utf-8";
    rule["search_encoding"] = rule["搜索编码"] || rule["search_encoding"] || "";
    rule["图片来源"] = rule["图片来源"] || "";
    rule["图片替换"] = rule["图片替换"] || "";
    rule["play_json"] = rule.hasOwnProperty("play_json")
      ? rule["play_json"]
      : [];
    rule["pagecount"] = rule.hasOwnProperty("pagecount")
      ? rule["pagecount"]
      : {};
    rule["proxy_rule"] = rule.hasOwnProperty("proxy_rule")
      ? rule["proxy_rule"]
      : "";
    if (!rule.hasOwnProperty("sniffer")) {
      // 默认关闭辅助嗅探
      rule["sniffer"] = false;
    }
    rule["sniffer"] = rule.hasOwnProperty("sniffer") ? rule["sniffer"] : "";
    rule["sniffer"] = !!(
      rule["sniffer"] &&
      rule["sniffer"] !== "0" &&
      rule["sniffer"] !== "false"
    );

    rule["isVideo"] = rule.hasOwnProperty("isVideo") ? rule["isVideo"] : "";
    if (rule["sniffer"] && !rule["isVideo"]) {
      // 默认辅助嗅探自动增强嗅探规则
      rule["isVideo"] =
        "http((?!http).){12,}?\\.(m3u8|mp4|flv|avi|mkv|rm|wmv|mpg|m4a|mp3)\\?.*|http((?!http).){12,}\\.(m3u8|mp4|flv|avi|mkv|rm|wmv|mpg|m4a|mp3)|http((?!http).)*?video/tos*|http((?!http).)*?obj/tos*";
    }

    rule["tab_remove"] = rule.hasOwnProperty("tab_remove")
      ? rule["tab_remove"]
      : [];
    rule["tab_order"] = rule.hasOwnProperty("tab_order")
      ? rule["tab_order"]
      : [];
    rule["tab_rename"] = rule.hasOwnProperty("tab_rename")
      ? rule["tab_rename"]
      : {};

    if (rule["headers"] && typeof rule["headers"] === "object") {
      try {
        let header_keys = Object.keys(rule["headers"]);
        for (let k of header_keys) {
          if (k.toLowerCase() === "user-agent") {
            let v = rule["headers"][k];
            if (["MOBILE_UA", "PC_UA", "UC_UA", "IOS_UA", "UA"].includes(v)) {
              rule["headers"][k] = eval(v);
            }
          } else if (k.toLowerCase() === "cookie") {
            let v = rule["headers"][k];
            if (v && v.startsWith("http")) {
              try {
                v = fetch(v);
                rule["headers"][k] = v;
              } catch (e) {
                console.log(`[t3][init]从${v}获取cookie发生错误:${e.message}`);
              }
            }
          }
        }
      } catch (e) {
        console.log(`[t3][init]处理headers发生错误:${e.message}`);
      }
    }

    rule_fetch_params = {
      headers: rule["headers"] || false,
      timeout: rule["timeout"],
      encoding: rule["encoding"],
    };
    oheaders = rule["headers"] || {};

    RKEY =
      typeof key !== "undefined" && key
        ? key
        : "drpy_" + (rule["title"] || rule["host"]);
    pre();
    return init_test();
  } catch (e) {
    console.info(`[t3][init]init_test发生错误:${e.message}`);
    return {
      version: VERSION,
      rkey: RKEY,
      rule: {},
    };
  }
};

module.exports = { init }