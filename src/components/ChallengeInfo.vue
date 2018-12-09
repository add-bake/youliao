<template>
  <div class="create-challenge">
    <my-header title="挑战描述" rightButton="下一步" :rightUnable="rightUnable" @nextStep="nextStep"></my-header>
    <div class="content">
      <textarea class="title-ipt text-adaption" v-model="challenge.questionContent" placeholder="请填写问题相关描述（选填）"></textarea>
      <div class="upload-box">
        <input @change="fileHandle($event)" type="file" ref="uploadFile" style="display: none">
        <input @change="fileVideoHandle($event)" type="file" ref="uploadVideo" style="display: none">
        <ul class="fix">
          <li class="upload-item pr l oh" v-for="(item,key) in strimagelist" :key="key">
            <span class="btn-del pa" @click="uploadDel(key)"></span>
            <img class="upload-img pa" :src="item">
          </li>
          <li class="btn-upload l" @click="chooseType" v-if="!uploadUnable">
            <span class="icon"></span>
            <p class="btn-text">添加照片</p>
          </li>
          <li
            class="upload-item pr l oh"
            v-if="videoPoster">
            <span class="btn-del pa" @click="videoDel"></span>
            <img
              class="upload-img pa"
              :src="videoPoster">
            <span
              class="btn-play pa"
              @click="playVideo">
            </span>
          </li>
          <li
            class="btn-upload l"
            @click="chooseVideo"
            v-if="!videoPoster">
            <span class="icon icon-video"></span>
            <p class="btn-text">添加视频</p>
          </li>
        </ul>
      </div>
      <div class="info-box">
        <p class="info-item">- 请描述您挑战背后的的痛点和需求是什么？为什么现有流程/产品/业务模式无法满足？</p>
        <p class="info-item">- (Optional) 您期待创新方案如何解决现有痛点</p>
      </div>
      <div class="picker-content">
        <div class="btn-picker" :class="{selected: dateSelected}" @click="openPicker">{{challenge.vsEndDate || '设置挑战结束时间'}}</div>
      </div>
      <mt-datetime-picker
        ref="picker"
        type="date"
        :startDate="startDate"
        @confirm="dateConfirm">
      </mt-datetime-picker>
      <div class="switch-box">
          <span>开启组队</span>
          <mt-switch v-model="challenge.vsSquadFlag" class="r"></mt-switch>
      </div>
      <div class="info-box">
        <p class="info-item">提示：开启功能后，该挑战将开放组队报名，员工点击报名后，创委会在后台收到报名数据</p>
      </div>
    </div>
    <video-popup
      ref="videoPopup"
      :id="videoId"
      :videoPoster="videoPoster">
    </video-popup>
  </div>
</template>

<script>
import {mapState, mapMutations} from 'vuex'
import dayjs from 'dayjs'
import http from '../utils/http.js'
import api from '../utils/api.js'
import VideoPopup from './VideoPopup'

export default {
  components: {
    VideoPopup
  },
  created(){
    this.strimagelist = this.challenge.strimagelist
    this.rightUnable = !this.challenge.vsEndDate
    this.startDate = new Date()
  },
  mounted(){
    this.autoTextarea()
  },
  data() {
    return {
      rightUnable: true,
      strimagelist: [],
      dateSelected: false,
      uploadUnable: false,
      videoPoster: '',
      videoId: '',
    }
  },
  computed: {
    ...mapState(['challenge', 'platform', 'sid'])
  },
  methods: {
    ...mapMutations(['incrementChallenge']),
    openPicker() {
      this.$refs.picker.open()
    },
    dateConfirm(val){
      this.incrementChallenge({vsEndDate: dayjs(val).format('YYYY/MM/DD')})
      this.dateSelected = true
      this.rightUnable = false
    },
    nextStep() {
      if(!this.challenge.vsEndDate){
        return this.showToast('请设置挑战结束时间')
      }
      this.incrementChallenge({strimagelist: this.strimagelist})
      this.$router.push('/choosetype')
    },
    chooseVideo () {
      if(this.platform == 1){
        //触发原生文件选择
        this.$bridge.callhandler('AppUploadingVideoHandler', {'fkeyId': this.challenge.id, 'fkeyType': 10, 'videoTitle': ''}, data => {
          // 处理返回数据
        })
        // 拿到原生返回的数据
        this.$bridge.registerhandler('backAppUploadingVideoHandler', async (data, responseCallback) => {
          this.videoPoster = `data:image/png;base64,${data.videoImage}`
          this.videoId = data.videoURL
        })
      } else {
        youliao.AppUploadingVideoHandler(JSON.stringify({'fkeyId': this.challenge.id, 'fkeyType': 10, 'videoTitle': ''}), result => {
          console.log(result)
        })
      }
    },
    async playVideo () {
      this.$refs.videoPopup.popupShowControl()
    },
    chooseType() {
      if(this.platform == 1){
        //触发原生文件选择
        this.$bridge.callhandler('AppGetFilesHandler', {'type':'1'}, (data) => {
          // 处理返回数据
        })
        // 拿到原生返回的数据
        this.$bridge.registerhandler('backAppGetFilesHandler', (data, responseCallback) => {
          let img = new Image
          let width = 500 //图像大小
          let quality = 0.7 //图像质量
          let canvas = document.createElement("canvas")
          let drawer = canvas.getContext("2d")
          img.src = `data:image/png;base64,${data.data}`
          img.onload = () => {
              canvas.width = width;
              canvas.height = width * (img.height / img.width);
              drawer.drawImage(img, 0, 0, canvas.width, canvas.height);
              this.fileChange(canvas.toDataURL("image/png", quality))
          }
        })
      } else {
        this.$refs.uploadFile.click()
      }
    },
    // 已上传项删除事件
    uploadDel(key) {
      this.strimagelist.splice(key,1)
      this.uploadUnable = false
    },
    fileHandle(el) {
      if (!el.target.files[0].size) return;
      let file = el.target.files[0]
      if (file.type.indexOf('image') == -1) {
        this.showToast('请选择图片文件');
      } else {
        let reader = new FileReader();
        let _this = this
        let img = new Image
        reader.readAsDataURL(file);
        reader.onload = function () {
          let width = 500 //图像大小
          let quality = 0.7 //图像质量
          let canvas = document.createElement("canvas")
          let drawer = canvas.getContext("2d")
          img.src = this.result;
          img.onload = function () {
              canvas.width = width;
              canvas.height = width * (img.height / img.width);
              drawer.drawImage(img, 0, 0, canvas.width, canvas.height);
              _this.fileChange(canvas.toDataURL("image/png", quality))
          }
        }
      }
      el.target.value = null
    },
    async videoDel () {
      this.showLoading()
      let data = await http.post({
        fkeyId: this.challenge.id
      }, api.deleteVideo)
      this.hideLoading()
      if (data.data.errormsg) {
        this.showAlert(err)
      } else {
        this.videoPoster = ''
        this.videoId = ''
      }
    },
    fileChange(file) {
      this.strimagelist.push(file)
      if(this.strimagelist.length >= 3){
        this.uploadUnable = true
      }
    },
    autoTextarea() {
      let obj=document.getElementsByClassName("text-adaption");
      let len=obj.length;

      for(let i=0;i<len;i++){
      obj[i].onkeyup = function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + "px";
      };
      }
    }
  }
}
</script>

<style lang="less" scoped>
.title-ipt {
  width: 100%;
  min-height: 2.08rem;
  padding: .4rem .58rem 0 .58rem;
  box-sizing: border-box;
  font-size: .32rem;
  color: #292929;
  line-height: .5rem;
  border: none;
  outline: none;
  resize: none;
}
.switch-box {
  padding: .28rem .45rem;
  font-size: .32rem;
  color: #262626;
  line-height: .64rem;

  .mint-switch {
    margin-left: .18rem;
  }
}
.upload-item(){
  box-sizing: border-box;
  width: 2.06rem;
  height: 2.06rem;
  margin: 0 .1rem .2rem .1rem;
  border: .02rem dashed #c1c1c1;
  border-radius: .16rem;
}
.upload-box {
  padding: .52rem .35rem .22rem .35rem;
  background-color: #fff;

  .btn-upload {
    .upload-item;
    .icon {
      display: block;
      width: .65rem;
      height: .54rem;
      margin: .56rem auto 0 auto;
      background: url("../assets/images/icon-camera.png") 0 0 no-repeat;
      background-size: 100% 100%;
      &.icon-video {
        background-image: url("../assets/images/icon-video.png");
      }
    }
    .btn-text {
      text-align: center;
      font-size: .26rem;
      color: #c7c7c7;
      line-height: .74rem;
    }
  }

  .upload-item {
    .upload-item;

    .btn-del {
      display: block;
      width: .34rem;
      height: .34rem;
      top: .1rem;
      right: .08rem;
      z-index: 2;
      border-radius: 50%;
      background: #ff3c00 url("../assets/images/close-white.png") center center no-repeat;
      background-size: .14rem .14rem;
    }

    .upload-img {
      display: block;
      top: 0;
      left: 0;
      z-index: 1;
      width: 100%;
      height: 100%;
    }
  }
}
.info-box {
  padding: .02rem .24rem;
  background-color: #f6f6f6;
  .info-item {
    padding: .09rem 0;
    font-size: .24rem;
    color: #949494;
    line-height: .32rem;
  }
}

.picker-content {
  padding: .26rem .24rem;
  border-bottom: 1px solid #eee;

  .btn-picker {
    box-sizing: border-box;
    height: .9rem;
    padding-left: .94rem;
    border: .02rem solid #dadada;
    border-radius: .08rem;
    font-size: .3rem;
    color: #b5b5b5;
    line-height: .86rem;
    background: #f8f8f8 url("../assets/images/icon-date.png") .24rem center no-repeat;
    background-size: .44rem .41rem;

    &.selected {
      color: #262626;
    }
  }
}
.btn-play {
  background-size: .8rem .8rem;
}
</style>
