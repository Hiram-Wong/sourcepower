import request from "@/utils/request";

export function fetchContentAll(doc) {
  return request({
    url: "/v1/content/all",
    method: "get",
    params: doc,
  });
}

export function fetchContentRank() {
  return request({
    url: "/v1/content/rank",
    method: "get",
  });
}

export function fetchContentCreator() {
  return request({
    url: "/v1/content/creator",
    method: "get",
  });
}

export function fetchContentHistory(doc) {
  return request({
    url: "/v1/content/history",
    method: "get",
    params: doc,
  });
}

export function fetchContentDetail(doc) {
  return request({
    url: `/v1/content/${doc}`,
    method: "get",
  });
}

export function addContent(doc) {
  return request({
    url: `/v1/content`,
    method: "post",
    data: doc,
  });
}

export function delContent(id) {
  return request({
    url: `/v1/content/${id}`,
    method: "delete",
  });
}

export function delBatchContent(doc) {
  return request({
    url: `/v1/content/batch`,
    method: "delete",
    data: doc,
  });
}

export function putContent(id, doc) {
  return request({
    url: `/v1/content/${id}`,
    method: "put",
    data: doc,
  });
}

export function fetchContentList(doc) {
  return request({
    url: "/v1/content/",
    method: "get",
    params: doc,
  });
}
