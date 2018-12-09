<template>
  <div class="custom-editor pr">
    <div @input="result" ref="editor" id="editor" @click="playVideo($event)"></div>
    <p class="placeholder pa" v-show="placeholderShow" v-html="placeholder"></p>
    <input @change="process" type="file" ref="file" accept="image/png,image/jpeg,image/gif,image/jpg" style="display: none"/>
    <video-popup
      ref="videoPopup"
      :id="videoId"
      :videoPoster="videoPoster">
    </video-popup>
  </div>
</template>

<script>
import WangEditor from 'wangeditor'
import 'url-search-params-polyfill'
import http from '../utils/http.js'
import api from '../utils/api.js'
import VideoPopup from './VideoPopup'
import {mapState} from 'vuex'

export default {
  components: {
    VideoPopup
  },
  mounted () {
    this.$nextTick(() => {
      let editor = new WangEditor('#editor')
      editor.customConfig.zIndex = 1
      editor.customConfig.menus = []
      editor.create()
      // document.getElementsByClassName('w-e-text')[0].innerHTML = `<p>${this.value}</p>` || '<p></p>'
      this.editor = editor
    })
  },
  computed: {
    ...mapState(['planId'])
  },
  data () {
    return {
      placeholder: '请详细描述您的方案<br>友情提示：草稿功能暂未上线，请注意保护您的智慧结晶',
      placeholderShow: true,
      editor: {},
      image: {
        // 设为false会将图片的base64路径直接插入
        upload: true,
        // 文件最大体积，单位字节  
        sizeLimit: 512 * 1024 * 5,
        // 压缩参数,默认使用localResizeIMG进行压缩,设置为null禁止压缩
        // width和height是文件的最大宽高
        compress: {
          width: 500,
          height: 500,
          quality: 70
        }
      },
      videoPoster: '',
      videoId: ''
    }
  },
  methods: {
    initVal(val) {
      if (val) {
        document.getElementsByClassName('w-e-text')[0].innerHTML = val
        this.placeholderShow = false
      }
    },
    result() {
      if (this.editor.txt.html().length > 11 || this.editor.txt.text()) {
        this.placeholderShow = false
      } else {
        this.placeholderShow = true
      }
      this.$emit('change', this.editor.txt.html())
    },
    pick(){
      if(this.$store.state.platform == 1){
        //触发原生文件选择
        this.$bridge.callhandler('AppGetFilesHandler', {'type':'1'}, (data) => {
            // 处理返回数据
        })
        // 拿到原生返回的数据
        this.$bridge.registerhandler('backAppGetFilesHandler', async (data, responseCallback) => {
            let file = this.dataURLtoFile(`data:image/png;base64,${data.data}`, '')
            this.fileHandle(file)
        })
      } else {
          this.$refs.file.click()
      }
    },
    process() {
      let file = this.$refs.file.files[0]
      this.fileHandle(file)
    },
    fileHandle(file) {
      let config = this.image

      this.$refs.file.value = null
      
      if (file.size > config.sizeLimit) {
          return this.showToast('上传文件超出大小')
      }

      if (config.compress) {
        let reader = new FileReader();
        let _this = this
        let img = new Image
        reader.readAsDataURL(file);
        reader.onload = function () {
          let canvas = document.createElement("canvas")
          let drawer = canvas.getContext("2d")
          img.src = this.result;
          img.onload = function () {
            canvas.width = config.compress.width;
            canvas.height = config.compress.width * (img.height / img.width);
            drawer.drawImage(img, 0, 0, canvas.width, canvas.height)
            _this.imgInsert(canvas.toDataURL("image/png", config.compress.quality))
          }
        }
      } else {
        let reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = e => {
          this.imgInsert(e.target.result)
        }
      }
    },
    imgInsert (fileUrl) {
      if (!this.image.upload) {
        this.placeholderShow = false
        this.editor.txt.append(`<img src="${fileUrl}">`)
        return
      }
      this.uploadToServer(fileUrl)
    },
    videoUpload () {
      // this.getPoster(require('../assets/images/img-error.jpg'),src => {
      //   this.editor.txt.append(`<img class="btn-play pr" src="${src}"/>`)
      //   this.$emit('change', this.editor.txt.html())
      // })
      if (this.$store.state.platform == 1){
        //触发原生文件选择
        this.$bridge.callhandler('AppUploadingVideoHandler', {'fkeyId': this.planId, 'fkeyType': 20, 'videoTitle': ''}, data => {
          // 处理返回数据
        })
        // 拿到原生返回的数据
        this.$bridge.registerhandler('backAppUploadingVideoHandler', async (data, responseCallback) => {
          this.videoPoster = `data:image/png;base64,${data.videoImage}`
          this.videoId = data.videoURL
          this.placeholderShow = false
          this.getPoster(`data:image/png;base64,${data.videoImage}`,src => {
            this.editor.txt.append(`<img class="btn-play pr" src="${src}"/>`)
            this.$emit('videoUploadBtnHide')
            this.$emit('change', this.editor.txt.html())
          })
        })
      } else {
        console.log('android upload')
      }
    },
    playVideo (event) {
      if (this.hasClass(event.target, 'btn-play')) {
        this.$refs.editor.blur()
        this.$refs.videoPopup.popupShowControl()
      }
    },
    uploadToServer (fileUrl) {
      let {sid,planId,baseUrl} = this.$store.state
      let param = new URLSearchParams()
      param.append('imgStr', fileUrl.split(',')[1])
      param.append('planId', planId)

      this.showLoading()
      this.$axios.post(`/Plan/insertPlanImage?__sid=${sid}`,param)
      .then(res => {
        this.hideLoading()
        if(res.data.data.imgUrl){
          this.placeholderShow = false
          this.editor.txt.append(`<img data-id="${res.data.data.id}" src="${res.data.data.imgUrl}">`)
          this.$emit('change', this.editor.txt.html())
        } else {
          this.showToast('上传失败，请重试')
        }
      })
      .catch(err => {
        this.hideLoading()
        this.showToast(err.message)
      }) 
    },
    dataURLtoFile(dataurl, filename) {
      let arr = dataurl.split(',')
      let mime = arr[0].match(/:(.*?);/)[1]
      let bstr = atob(arr[1])
      let n = bstr.length
      let u8arr = new Uint8Array(n)
      while(n--){
          u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, {type:mime})
    },
    getPoster (src, callback) {
      let img = new Image
      let playBtn = new Image
      let width = 750 //图像大小
      let quality = 0.7 //图像质量
      let canvas = document.createElement("canvas")
      let drawer = canvas.getContext("2d")
      img.setAttribute('crossorigin', 'anonymous')
      img.src = src
      playBtn.src = require('../assets/images/btn-play.png')
      img.onload = () => {
        canvas.width = width
        canvas.height = width * (img.height / img.width)
        drawer.drawImage(img, 0, 0, canvas.width, canvas.height)
        drawer.drawImage(playBtn, (canvas.width - 130) / 2, (canvas.height - 130) / 2, 130, 130)
        callback(canvas.toDataURL("image/png", quality))
      }
    },
    hasClass (elem, className) {
      var div = document.createElement("div")
      if( "classList" in div && typeof div.classList.contains === "function" ) {
        return elem.classList.contains(className)
      } else {
        var classes = elem.className.split(/\s+/)
        for(var i= 0 ; i < classes.length ; i ++) {
            if( classes[i] === className ) {
                return true
            }
        }
        return false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.custom-editor {
  /deep/ .w-e-toolbar {
    display: none;
  }
  /deep/ .w-e-text-container {
    height: auto!important;
    border: none!important;
    .w-e-text {
      position: relative;
      min-height: 5rem;
      padding: 0 .24rem 0 0;
      margin: 0;
      font-size: .28rem;
      line-height: .6rem;
      overflow: hidden;
      p {
        margin: 0;
      }
    }
  }
  .placeholder {
    position: absolute;
    top: .1rem;
    right: .24rem;
    font-size: .28rem;
    color: #b5b5b5;
  }
  /deep/ .btn-play {
    width: 100%;
    border-radius: 3px;
    overflow: hidden;
  }
}
</style>
