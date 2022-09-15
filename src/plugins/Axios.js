import Vue from "vue";
import axios from "axios";
 
const url = "http://localhost/" //后台地址
axios.defaults.baseURL = url; //请求默认后台地址
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
Vue.prototype.$http = axios //后续请求使用
Vue.prototype.$http_url = url //全局后台地址
