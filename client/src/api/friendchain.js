import request from '@/utils/request';

export function fetchFriendChainAll() {
  return request({
    url: '/v1/friendchain/all',
    method: 'get'
  });
}

export function addFriendChain(doc) {
  return request({
    url: `/v1/friendchain/`,
    method: "post",
    data: doc,
  });
}

export function delFriendChain(id) {
  return request({
    url: `/v1/friendchain/${id}`,
    method: "delete"
  });
}

export function delBatchFriendChain(doc) {
  return request({
    url: `/v1/friendchain/batch`,
    method: "delete",
    data: doc
  });
}

export function putFriendChain(id, doc) {
  return request({
    url: `/v1/friendchain/${id}`,
    method: "put",
    data: doc,
  });
}

export function fetchFriendChainList(doc) {
  return request({
    url: "/v1/friendchain/",
    method: "get",
    params: doc,
  });
}