import axios from "axios";
import { useUserStore } from "@/store";

const baseURL = "/api";

const service = axios.create({
  baseURL,
  timeout: 1000 * 60,
});

service.interceptors.request.use((config) => {
  const user = localStorage.getItem("user");
  const jwt = user ? JSON.parse(user)?.token : null;
  if (jwt) config.headers["Authorization"] = "Bearer " + jwt;

  return config;
});

service.interceptors.response.use(
  (response) => {
    if (response?.data?.code === -2) {
      const userStore = useUserStore();
      userStore.logout();
    }
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

export default request;
