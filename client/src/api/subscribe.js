import request from "@/utils/request";

export function setSubscribe(doc) {
  return request({
    url: "/v1/subscribe/",
    method: "post",
    data: doc,
  });
}

export function putSubscribe(doc) {
  return request({
    url: "/v1/subscribe/",
    method: "put",
    data: doc,
  });
}

export function fetchSubscribe(doc) {
  return request({
    url: `/v1/subscribe/${doc}`,
    method: "get",
  });
}

export function fetchSubscribeCode() {
  return request({
    url: `/v1/subscribe/code`,
    method: "get",
  });
}

export function getList(doc) {
  return request({
    url: "/v1/subscribe/",
    method: "get",
    params: doc,
  });
}

export function delSubscribe(id) {
  return request({
    url: `/v1/subscribe/${id}`,
    method: "delete",
  });
}

export function delBatchSubscribe(doc) {
  return request({
    url: `/v1/subscribe/batch`,
    method: "delete",
    data: doc,
  });
}

export function putCodeSubscribe(id, doc) {
  return request({
    url: `/v1/subscribe/${id}`,
    method: "put",
    data: doc,
  });
}

export function addSubscribe(doc) {
  return request({
    url: `/v1/subscribe/`,
    method: "post",
    data: doc,
  });
}

export function getManage() {
  return request({
    url: `/v1/manage/main`,
    method: "get",
  });
}

export function makeManage() {
  return request({
    url: `/v1/manage/make`,
    method: "get",
  });
}

export function putManage(doc) {
  return request({
    url: `/v1/manage/main`,
    method: "put",
    headers: {
      "Content-Type": "text/plain",
    },
    data: doc,
  });
}
