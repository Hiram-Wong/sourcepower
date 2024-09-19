const axios = require("axios");

const baseURL = "/api";

const service = axios.create({
  baseURL,
  timeout: 1000 * 60,
});

service.interceptors.request.use((config) => {
  return config;
});

service.interceptors.response.use(
  (response) => {
    const res = response;
    return res;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const request = async (config) => {
  const { data } = await service.request(config);
  return data;
};

module.exports = request;
