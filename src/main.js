// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Mint from 'mint-ui'
import axios from './axios'
import store from './store/index.js'
import Bridge from './utils/bridge'
import MyHeader from '@/components/MyHeader'
import 'mint-ui/lib/style.css'
import './assets/css/my-mint.less'
import './assets/css/my-style.less'
import Vconsole from 'vconsole'
let vconsole = new Vconsole()

Vue.use(Mint)
Vue.component("MyHeader",MyHeader);
Vue.prototype.$bridge = Bridge
Vue.prototype.$bus = new Vue()

window.MessageBox = Mint.MessageBox

Vue.mixin({
  methods: {
    showToast(text) {
      Mint.Toast({
        message: text,
        position: 'bottom'
      })
    },
    showLoading(){
      Mint.Indicator.open({
        spinnerType: 'fading-circle'
      })
    },
    hideLoading(){
      Mint.Indicator.close()
    },
    showAlert(text,ok) {
      Mint.MessageBox.alert(text).then(() => {
        if(Object.prototype.toString.call(ok)=== '[object Function]') ok()
      });
    },
    trim(str) {
      return str.replace(/(^\s*)|(\s*$)/g,"")
    },
    match(obj,arr){
      let newObj = {}
      Object.keys(obj).forEach( key => {
        arr.forEach( arrItem => {
          if(key === arrItem) newObj[key] = obj[key]
        })
      })
      return newObj
    }
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  axios,
  store,
  components: { App },
  template: '<App/>'
})
