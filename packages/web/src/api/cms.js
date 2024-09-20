import request from "@/utils/request";

export function fetchSearchList(doc) {
  return request({
    url: "/v1/cms/search",
    method: "get",
    params: doc,
  });
}

export function fetchDetail(id) {
  return request({
    url: `/v1/cms/detail/${id}`,
    method: "get",
  });
}

export function fetchHot(id, doc) {
  return request({
    url: `/v1/cms/hot/${id}`,
    method: "get",
    params: doc,
  });
}

export function fetchCmsApi() {
  return request({
    url: `/v1/cms/api`,
    method: "get",
  });
}

export function putCmsApi(doc) {
  return request({
    url: `/v1/cms/api`,
    method: "put",
    data: doc
  });
}