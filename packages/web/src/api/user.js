import request from "@/utils/request";

export function apiRegister(doc) {
  return request({
    url: "/v1/user/register",
    method: "post",
    data: doc,
  });
}

export function apiLogin(doc) {
  return request({
    url: "/v1/user/login",
    method: "post",
    data: doc,
  });
}

export function userInfo() {
  return request({
    url: "/v1/user/info",
    method: "get",
  });
}

export function apiForgetPassword(doc) {
  return request({
    url: "/v1/user/forgot-password",
    method: "post",
    data: doc,
  });
}

export function apiSendMail(doc) {
  return request({
    url: "/v1/user/verify-email",
    method: "post",
    data: doc,
  });
}

export function getList(doc) {
  return request({
    url: "/v1/user/",
    method: "get",
    params: doc,
  });
}

export function getYzm(doc) {
  return request({
    url: "/v1/user/yzm",
    method: "get",
    params: doc,
  });
}

export function delUser(id) {
  return request({
    url: `/v1/user/${id}`,
    method: "delete"
  });
}

export function delBatchUser(doc) {
  return request({
    url: `/v1/user/batch`,
    method: "delete",
    data: doc
  });
}

export function putPasswdUser(id, doc) {
  return request({
    url: `/v1/user/${id}`,
    method: "put",
    data: doc,
  });
}

export function addUser(doc) {
  return request({
    url: `/v1/user/`,
    method: "post",
    data: doc,
  });
}