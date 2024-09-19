import request from '@/utils/request';

export function fetchInfo() {
  return request({
    url: '/v1/system/info',
    method: 'get'
  });
}

export function fetchNotice() {
  return request({
    url: '/v1/system/notice',
    method: 'get'
  });
}

export function fetchDonate() {
  return request({
    url: '/v1/system/donate',
    method: 'get'
  });
}

export function putNotice(doc) {
  return request({
    url: '/v1/system/notice',
    method: 'put',
    data: doc
  });
}

export function upload(doc) {
  return request({
    url: `/v1/system/upload`,
    method: "post",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data: doc,
  });
}