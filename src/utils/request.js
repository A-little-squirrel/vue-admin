import axios from "axios";
import { Message } from "element-ui";

// 创建axios，赋给变量service
const BASEURL = process.env.NODE_ENV === "production" ? "" : "/devApi";

const service = axios.create({
  baseURL: BASEURL,
  // 请求超时的时间
  timeout: 10000
});

/**
 * 请求接口前，做一些数据处理（请求拦截器）
 */
service.interceptors.request.use(
  function(config) {
    // 在发送请求之前做些什么
    // 在请求头添加参数
    // config.headers[""] = "";
    // config.headers. = "";
    return config;
  },
  function(error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

/**
 * 请求接口，返回数据进行拦截（响应拦截器）
 */
service.interceptors.response.use(
  function(response) {
    // 响应数据返回用户名未添加
    let data = response.data;
    if (data.resCode !== 0) {
      Message.error(data.message);
      return Promise.reject(data);
    } else {
      return response;
    }
  },
  function(error) {
    // 对响应错误做点什么
    return Promise.reject(error);
  }
);

export default service;
