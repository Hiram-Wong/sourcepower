/*!
 * @module drpyInject
 * @brief T3网络请求、缓存模块处理库
 * @version 3.1.3
 *
 * @original-author hjdhnx
 * @original-source {@link https://github.com/hjdhnx/hipy-server/blob/master/app/utils/quickjs_ctx.py | Source on GitHub}
 *
 * @modified-by HiramWong <admin@catni.cn>
 * @modification-date 2024-07-04T21:11:19+08:00
 * @modification-description Python转TypeScript, 适用于JavaScript项目
 *
 * **事件说明**:
 * - 为了确保所有接口都为同步事件，部分接口采用后端实现
 *   - cache缓存方法
 *   - batchFetch批量请求方法
 */

const syncFetch = require("sync-fetch");
const NodeCache = require("node-cache");
const jsoup = require("./htmlParser");

/**
 * 将obj所有key变小写
 * @param obj
 */
function keysToLowerCase(obj) {
  return Object.keys(obj).reduce((result, key) => {
    const newKey = key.toLowerCase();
    result[newKey] = obj[key]; // 如果值也是对象，可以递归调用本函数
    return result;
  }, {});
}

const baseRequest = (_url, _object, _js_type = 0) => {
  const method = (_object.method || "GET").toUpperCase();
  // const timeout: number = _object.timeout || 5000;
  const withHeaders = _object.withHeaders || false;
  const body = _object.body || "";
  const bufferType = _object.buffer || 0;
  let encoding = _object.encoding || "utf-8";
  let data = _object.data || {};
  let headers = _object.headers || {};
  const emptyResult = { content: "", body: "", headers: {} };

  if (_object.hasOwnProperty("redirect")) {
    const redirect =
      _object.redirect === 1 || _object.redirect === true ? "follow" : "manual";
    headers["Redirect"] = redirect;
  }

  if (body && Object.keys(data).length === 0) {
    if (body.includes("&")) {
      body.split("&").forEach((param) => {
        let key = param.split("=")[0];
        let value = param.split("=").slice(1).join("=");
        data[key] = value;
      });
    } else {
      data = body;
    }
  } else if (!body && Object.keys(data).length !== 0 && method !== "GET") {
    const contentTypeKeys = Object.keys(headers).filter(
      (key) => key.toLowerCase() === "content-type"
    );
    const default_type = "application/json";
    let contentType = default_type;
    if (contentTypeKeys.length > 0) {
      const contentTypeKey = contentTypeKeys.slice(-1)[0];
      const oldContentType = headers[contentTypeKey];
      // if (!oldContentType.includes(contentType)) {
      //   headers[contentTypeKey] = contentType;
      // }
      contentType = oldContentType;
    } else {
      headers["Content-Type"] = contentType;
    }
    if (typeof data === "object" && contentType.includes(default_type)) {
      // data = JSON.stringify(data);
      console.log("识别到要提交json数据,这里不管它,后面req_body会自动处理");
    }
  }

  if (headers["Content-Type"]?.includes("application/x-www-form-urlencoded")) {
    data = new URLSearchParams(data).toString();
  }

  const customHeaders = {
    Cookie: "custom-cookie",
    Origin: "custom-origin",
    Host: "custom-host",
    Connection: "custom-connection",
    "User-Agent": "custom-ua",
    Referer: "custom-referer",
    Redirect: "custom-redirect",
  };
  headers = keysToLowerCase(headers);
  // 从content-type拿到正确的网页编码
  if (
    headers["content-type"] &&
    /charset=(.*)/i.test(headers["content-type"])
  ) {
    // @ts-ignore
    encoding = headers["content-type"]
      .match(/charset=(.*)/i)[1]
      .split(";")[0]
      .trim();
  }

  for (const [originalHeader, customHeader] of Object.entries(customHeaders)) {
    let originalHeaderKey = originalHeader.toLowerCase();
    if (headers.hasOwnProperty(originalHeaderKey)) {
      headers[customHeader] = headers[originalHeaderKey];
      delete headers[originalHeaderKey];
    }
  }

  let r;

  if (method === "GET") {
    const url =
      Object.keys(data).length === 0
        ? _url
        : `${_url}?${new URLSearchParams(data).toString()}`;
    r = syncFetch(url, {
      headers,
    });
  } else {
    let req_body = "";
    if (typeof data === "string") {
      req_body = decodeURIComponent(data);
    } else if (
      typeof data === "object" &&
      headers["content-type"] &&
      headers["content-type"].includes("application/json")
    ) {
      req_body = JSON.stringify(data);
    } else {
      req_body = new URLSearchParams(data).toString();
    }
    const requestOptions = {
      method,
      headers,
      body: req_body,
      credentials: "omit", // 禁止自动带cookie
      // credentials: 'include',
    };
    r = syncFetch(_url, requestOptions);
  }

  const formatHeaders = {};
  for (const [key, value] of r.headers.entries()) {
    if (key.toLowerCase() === "custom-set-cookie") {
      formatHeaders["set-cookie"] = value;
    } else {
      formatHeaders[key] = value;
    }
  }

  const blob = r.blob();
  // @ts-ignore
  const reader = new FileReaderSync();

  if (_js_type === 0) {
    if (withHeaders) {
      return blob
        ? { body: reader.readAsText(blob, encoding), headers: formatHeaders }
        : emptyResult;
    } else {
      // @ts-ignore
      return reader.readAsText(blob, encoding) || "";
    }
  } else if (_js_type === 1) {
    let content;
    if (bufferType === 2) {
      content = reader.readAsDataURL(blob);
      if (content.includes("base64,")) {
        content = content.split("base64,")[1];
      }
      // const uint8Array = new Uint8Array(r.arrayBuffer()); // 将 ArrayBuffer 转换为一个 Uint8Array
      // const buffer = Buffer.from(uint8Array); // 使用 Buffer.from 将 Uint8Array 转换为 Buffer
      // const base64String = buffer.toString('base64'); // 将 Buffer 转换为 Base64 字符串
      // content = base64String;
    } else {
      content = reader.readAsText(blob, encoding);
    }
    return content ? { content, headers: formatHeaders } : emptyResult;
  } else {
    return emptyResult;
  }
};

const req = (_url, _object) => {
  return baseRequest(_url, _object, 1);
};

const joinUrl = (base, url) => {
  base = base || "";
  url = url || "";
  base = base.trim().replace(/\/+$/, "");
  url = url.trim().replace(/\/+$/, "");
  console.log("joinUrl:", base, url);

  let u;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    u = new URL(url);
  } else if (url.startsWith("://")) {
    u = new URL(base + url);
  } else if (url.startsWith("//")) {
    u = new URL(base.startsWith("http:") ? "http:" + url : "https:" + url);
  } else {
    u = new URL(base + "/" + url);
  }

  if (!u.pathname && new URL(base).pathname) {
    u.pathname = new URL(base).pathname;
  }

  if (!u.search && new URL(base).search) {
    u.search = new URL(base).search;
  }

  return u.toString();
};

const resolve = (from, to) => {
  const resolvedUrl = new URL(to, new URL(from, "resolve://"));
  if (resolvedUrl.protocol === "resolve:") {
    const { pathname, search, hash } = resolvedUrl;
    return pathname + search + hash;
  }
  return resolvedUrl.href;
};

const pdfh = (html, parse, base_url = "") => {
  const jsp = new jsoup(base_url);
  return jsp.pdfh(html, parse, base_url);
};

const pd = (html, parse, base_url = "") => {
  const jsp = new jsoup(base_url);
  return jsp.pd(html, parse);
};

const pdfa = (html, parse) => {
  const jsp = new jsoup();
  return jsp.pdfa(html, parse);
};

const pdfl = (html, parse, list_text, list_url, url_key) => {
  const jsp = new jsoup();
  return jsp.pdfl(html, parse, list_text, list_url, url_key);
};

const batchFetch = (items, max_workers = 5) => {
  const headers = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      items,
      max_workers,
    },
  };
  const url = `127.0.0.1:3000/v1/util/batchFetch`;
  const res = req(url, headers);
  return JSON.parse(res.content).data;
};

const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

const local_get = (_id, key, value = "") => {
  const res = cache.get(`${_id}${key}`) || value;
  return res;
};

const local_set = (_id, key, value) => {
  cache.set(`${_id}${key}`, value, 60);
  return "success";
};

const local_delete = (_id, key) => {
  cache.del(`${_id}${key}`);
  return "success";
};

const local = {
  get: local_get,
  set: local_set,
  delete: local_delete,
};

module.exports = {
  batchFetch,
  pdfh,
  pdfa,
  pdfl,
  pd,
  local,
  req,
  joinUrl,
  resolve,
};
