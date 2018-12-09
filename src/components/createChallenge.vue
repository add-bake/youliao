<template>
  <div class="create-challenge">
    <my-header title="挑战主题" rightButton="下一步" :rightUnable="rightUnable" @nextStep="nextStep"></my-header>
    <div class="content">
      <textarea class="title-ipt" v-model="challenge.questionTitle" placeholder="请写下你的挑战主题（必填）" maxlength="50"></textarea>
      <p class="info">上传封面图片</p>
      <div class="upload-box" @click="chooseType" :class="{'has-upload': hasUpload}">
        <img class="upload-img" v-if="challenge.coverImgUrl" :src="challenge.coverImgUrl">
      </div>
      <p class="tip">小提示：如果没有合适的图片，封面将会以默认的创新主题封面代替</p>
      <input @change="fileHandle($event)" type="file" ref="uploadFile" accept="image/*" style="display: none">
      <image-clipper v-if="clipperShow" :img="challenge.coverImgUrl" @ok="clipOk" @cancel="clipCancel" :clipper-img-width="690" :clipper-img-height="285"></image-clipper>
    </div>
    <!-- <transition name="fade-in-down"> -->
      <association :title="challenge.questionTitle"></association>
    <!-- </transition> -->
  </div>
</template>

<script>
import imageClipper from './imageClipper'
import Association from './Association'
import shortid from 'js-shortid'
import {mapState, mapMutations} from 'vuex'

export default {
  components: {
    'image-clipper': imageClipper,
    'association': Association
  },
  created(){
    let id = shortid.gen()
    this.incrementChallenge({id})
    this.rightUnable = this.trim(this.challenge.questionTitle) === '' ? true : false
  },
  data(){
    return {
      rightUnable: true,
      clipperShow: false,
      hasUpload: false
    }
  },
  computed: {
    ...mapState(['challenge','platform'])
  },
  watch: {
    'challenge.questionTitle'(val){
      this.rightUnable = this.trim(val) === '' ? true : false
    }
  },
  methods: {
    ...mapMutations(['incrementChallenge']),
    nextStep() {
      if(!this.trim(this.challenge.questionTitle)){
        return this.showToast('请填写挑战主题')
      }
      this.$router.push('/challengeinfo')
    },
    clipOk(imgData) {
      if(imgData){
        this.incrementChallenge({coverImgUrl: imgData})
        this.clipperShow = false
        this.hasUpload = true
      } else {
        this.showToast('图片裁剪失败，请重试')
      }
    },
    clipCancel() {
      this.incrementChallenge({coverImgUrl: ''})
      this.clipperShow = false
    },
    chooseType() {
      if(this.platform == 1){
        //触发原生文件选择
        this.$bridge.callhandler('AppGetFilesHandler', {'type':'1'}, (data) => {
          // 处理返回数据
        })
        // 拿到原生返回的数据
        this.$bridge.registerhandler('backAppGetFilesHandler', async (data, responseCallback) => {
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
      el.target.value = ''
    },
    fileChange(file) {
      this.incrementChallenge({coverImgUrl: file})
      this.clipperShow = true
    }
  }
}
</script>

<style scoped lang="less">
.title-ipt {
  width: 100%;
  height: 2.08rem;
  padding: .4rem .58rem 0 .58rem;
  box-sizing: border-box;
  font-size: .32rem;
  color: #292929;
  line-height: .5rem;
  border: none;
  outline: none;
  resize: none;
}
.info {
  padding: 0 .44rem;
  font-size: .36rem;
  color: #000;
  line-height: .74rem;
}
.upload-box {
  width: 6.9rem;
  height: 2.85rem;
  margin: 0 auto;
  border: .02rem dashed #c1c1c1;
  border-radius: .15rem;
  background: url("../assets/images/btn-upload.png") center center no-repeat;
  background-size: 1.2rem 1.19rem;

  .uploadimg {
    display: block;
    width: 100%;
    height: 100%;
    background-color: #fff;
  }
  &.has-upload {
    background-image: none;
  }
}
.tip {
  width: 6.94rem;
  margin: .3rem auto 0 auto;
  font-size: .36rem;
  color: #c8c8c8;
  line-height: .44rem;
}
</style>
