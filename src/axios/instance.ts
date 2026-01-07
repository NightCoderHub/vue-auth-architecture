// src/api/instance.ts
import { Api } from "@/api/index";

// 实例化 API
// 因为你在模板里已经写死了 this.instance = myAxiosInstance，
// 所以这里不需要再传配置，除非你想覆盖 baseURL
const apiProvider = new Api();

export default apiProvider;