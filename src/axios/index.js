import Vue from 'vue'
import axios from 'axios'

axios.defaults.baseURL = process.env.API_ROOT
Vue.prototype.$axios = axios

export default ({

})