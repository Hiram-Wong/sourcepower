import request from "@/utils/request";

export function fetchComment(doc) {
  return request({
    url: "/v1/comment/info/list",
    method: "get",
    params: doc,
  });
}

export function fetchReply(doc) {
  return request({
    url: "/v1/comment/reply/list",
    method: "get",
    params: doc,
  });
}

export function addComment(doc) {
  return request({
    url: `/v1/comment/info`,
    method: "post",
    data: doc,
  });
}

export function addReply(doc) {
  return request({
    url: `/v1/comment/reply`,
    method: "post",
    data: doc,
  });
}

export function delComment(id) {
  return request({
    url: `/v1/comment/info/${id}`,
    method: "delete",
  });
}

export function delBatchComment(doc) {
  return request({
    url: `/v1/comment/info/batch`,
    method: "delete",
    data: doc,
  });
}

export function delReply(id) {
  return request({
    url: `/v1/comment/reply/${id}`,
    method: "delete",
  });
}

export function delBatchReply(doc) {
  return request({
    url: `/v1/comment/reply/batch`,
    method: "delete",
    data: doc,
  });
}

export function putComment(id, doc) {
  return request({
    url: `/v1/comment/info/${id}`,
    method: "put",
    data: doc,
  });
}

export function putReply(id, doc) {
  return request({
    url: `/v1/comment/reply/${id}`,
    method: "put",
    data: doc,
  });
}

export function fetchCommentList(doc) {
  return request({
    url: "/v1/comment/info",
    method: "get",
    params: doc,
  });
}

export function fetchReplyList(doc) {
  return request({
    url: "/v1/comment/reply",
    method: "get",
    params: doc,
  });
}