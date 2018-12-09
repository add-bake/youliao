<template>
  <div class="add-file">
    <my-header
      title="添加附件"
      rightButton="提交"
      :leftButton="leftButton"
      :rightUnable="rightUnable"
      :customBack="customBack"
      @nextStep="nextStep"
      @back="back">
    </my-header>
    <div class="content">
      <div class="upload-box">
        <input class="file-upload" type="file" ref="fileUpload" @change="fileHandle($event)">
        <ul class="fix">
          <li class="upload-item pr l" v-for="(item,key) in answerPlanFileList" :key="item.id">
            <span class="btn-del pa" @click="delExisting(item.id,key)"></span>
            <span class="icon-file" :class="typeHandle(item.fileUrl)"></span>
            <p class="file-name el2">{{item.fileName}}</p>
          </li>
          <li class="upload-item pr l" v-for="(item,key) in uploadFile" :key="key">
            <span class="btn-del pa" @click="uploadDel(key)"></span>
            <span class="icon-file" :class="`${item.type}`"></span>
            <p class="file-name el2">{{item.name}}</p>
          </li>
          <li class="btn-upload l" @click="upload"></li>
        </ul>
      </div>
      <p class="upload-info">文件必须小于5 MB<br>允许的文件类型：pdf/doc/docx/ppt/pptx/excel/xls/xlsx</p>
      <div class="tip">
        <span class="icon"></span>
        <span class="tip-text"><i>小提示：</i>我们建议您在有料创新PC端中编辑附件，这样会更加轻松愉快。</span>
      </div>
      <div class="public-file">
        <span class="info">公开附件</span>
        <mt-switch v-model="plan.isPublicFile" class="r"></mt-switch>
      </div>
      <p class="public-info">选择公开附件，则附件内容对全部有料用户开放；选择不公开附件，则附件内容只对创新委员开放</p>
      <p class="type-info">请根据如下内容选择方案的类型(必填)</p>
      <field-picker 
        fieldTitle="创新技术"
        require
        :fieldOptions="technologyData"
        :fieldValue="plan.technologyText"
        @fieldChange="technologyChange">
      </field-picker>
    </div>
  </div>
</template>

<script>
import qs from 'qs'
import MyHeader from './MyHeader'
import FieldPicker from './FieldPicker.vue'
import {mapState, mapMutations} from 'vuex'
import http from '../utils/http.js'
import api from '../utils/api.js'

export default {
  components: {
    'my-header': MyHeader,
    'field-picker': FieldPicker
  },
  created() {
    this.getData()
    this.rightUnable = this.plan.technologyText === '' || this.plan.technologyText === '请选择' ? true : false
    this.answerPlanFileList = this.$store.state.plan.answerPlanFileList
  },
  data() {
    return {
      rightUnable: true,
      leftButton: '上一步',
      customBack: false,
      uploadFile:[],
      uploadData: [],
      technologyData: [],
      technologyValue: [],
      delPlanFileIds: [],
      answerPlanFileList: [] //从方案详情带过来的已上传文件集合
    }
  },
  computed: {
    ...mapState(['sid','planId','plan','platform'])
  },
  methods: {
    ...mapMutations(['incrementPlan','updatePlanFile', 'updateDepthHistory']),
    // 上传事件触发
    upload() {
      if(this.platform == 1){
        //触发原生文件选择
        this.$bridge.callhandler('AppGetFilesHandler', {'type':'2'}, (data) => {
          // 处理返回数据
        })
        // 拿到原生返回的数据
        this.$bridge.registerhandler('backAppGetFilesHandler', async (data, responseCallback) => {
          let file = await this.dataURLtoFile(data.data, data.fileName)
          this.fileData(file)
        })
      } else {
        this.$refs.fileUpload.click()
      }
    },
    fileHandle(event) {
      this.fileData(event.target.files[0])
    },
    // base64转文件
    dataURLtoFile(dataurl, filename) {
      let mime = filename.split(',')[1]
      let bstr = atob(dataurl)
      let n = bstr.length
      let u8arr = new Uint8Array(n);
      while(n--){
          u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, {type:mime});
    },
    technologyChange(result) {
      if(result.index >= 0){
        this.incrementPlan({technologyText: result.value, technologyId: this.technologyValue[result.index]})
        this.rightUnable = false
      } else {
        this.incrementPlan({technologyText: '', technologyId: ''})
        this.rightUnable = true
      }
    },
    async getData() {
      this.showLoading()
      let technology = await http.post({
        dictType: '30'
      },api.getVSDictType)
      this.hideLoading()
      if(technology.data.data.length){
        technology.data.data.map( val => {
          this.technologyData.push(val.value)
          this.technologyValue.push(val.id)
        })
      } else {
        this.showToast('创新技术数据为空')
      }
    },
    delExisting(id,index) {
      this.delPlanFileIds.push(id)
      this.answerPlanFileList.splice(index,1)
    },
    //上传文件处理
    fileData(file){
      let AllFileExt='pdf|doc|docx|ppt|pptx|excel|xls|xlsx|'
      let fileType = file.name.substring(file.name.lastIndexOf(".")+1).toLowerCase()
      if(AllFileExt.indexOf(fileType+"|")==-1) {
        return this.showToast('该文件类型不允许上传')
      }
      if(file.size / 1024 /1024 > 5) {
        return this.showToast('您上传的文件超出大小')
      }
      this.uploadFile.push({
        type: this.typeHandle(file.name),
        name: file.name
      })
      this.uploadData.push(file)
    },
    // 已上传项删除事件
    uploadDel(key) {
      this.uploadFile.splice(key,1)
      this.uploadData.splice(key,1)
      this.rightUnable = this.uploadData.length ? false : true
    },
    nextStep() {
      if(this.plan.technologyId === ''){
        return this.showToast('方案类型是必选的')
      }
      if (this.customBack) {
        this.submitFile()
      } else {
        this.submitPlan((rewardInfo) => {
          this.submitFile(rewardInfo)
        })
      }
    },
    async submitPlan (callback) {
      let params = this.match(this.plan,['planTitle', 'answerContent', 'vsSquadFlag', 'questionId', 'innovateId', 'departmentId', 'departmentText', 'innovateText', 'delImgIds'])
      params.vsSquadFlag = params.vsSquadFlag ? 1 : 2
      this.showLoading()
      let res = await http.post(Object.assign({
        planAnswerType: '20',
        id: this.planId
      }, params), this.$route.query.planId ? api.updatePlan : api.insertPlan)
      if(res.data.errormsg === ''){
        if (this.plan.draftId) this.deleteDraft()
        this.leftButton = '关闭'
        this.customBack = true
        callback(res.data.data.rewardInfo)
      } else {
        this.hideLoading()
        return this.showAlert(res.data.errormsg)
      }
    },
    submitFile (rewardInfo) {
      this.showLoading()
      let formData = new FormData()
      formData.append('planId',this.planId)
      formData.append('isPublicFile',this.plan.isPublicFile ? 1 : 2)
      formData.append('technologyId',this.plan.technologyId)
      formData.append('technologyText',this.plan.technologyText)
      this.uploadData.map(item => {
        formData.append('uploadPicture',item)
      })
      if(this.delPlanFileIds.length){
        this.delPlanFileIds.map(item => {
          formData.append('delPlanFileIds',item)
        })
      }
      this.$axios.post(`${this.$route.query.planId ? api.updateuploadPlanFiles : api.uploadPlanFiles}?__sid=${this.sid}`,formData)
      .then(res => {
        this.hideLoading()
        if(res.data.errormsg === ''){
          let msg = this.$route.query.planId ? '方案更新成功' : '方案提交成功'
          let info = rewardInfo && rewardInfo.reward && rewardInfo.reward > 0 ? '，积分+' + rewardInfo.reward : ''
          this.showToast(`${msg}${info}`)
          this.incrementPlan({
            technologyText: '',
            technologyId: '',
            isPublicFile: false
          })
          this.back()
        } else {
          return this.showAlert(res.data.errormsg)
        }
      })
      .catch(err => {
        this.hideLoading()
        this.showAlert(err)
      })
    },
    back () {
      this.$router.go(-2)
      this.updateDepthHistory('/addfile')
      this.updateDepthHistory('/createplan')
    },
    // 上传文件类型处理
    typeHandle(fileUrl) {
      let fileType = fileUrl.substring(fileUrl.lastIndexOf(".")+1).toLowerCase()
      let result = ''
      switch(fileType){
        case 'docx':
          return 'doc'
          break;
        case 'pptx':
          return 'ppt'
          break;
        default:
          return fileType
      }
    },
    // 删除草稿
    deleteDraft () {
      http.post({
        id: this.plan.draftId
      }, api.deleteDraft)
    }
  }
}
</script>

<style lang="less" scoped>
.add-file {
  height: 100%;
  overflow-y: auto;
  background-color: #f6f6f6;
  -webkit-overflow-scrolling: touch;

  .wrap() {
    padding: 0 .45rem;
  }
  .content {
    .upload-item(){
      box-sizing: border-box;
      width: 2.06rem;
      height: 2.06rem;
      margin: 0 .1rem .2rem .1rem;
      border: .02rem dashed #c1c1c1;
      border-radius: .16rem;
    }
    .upload-box {
      padding: .2rem .35rem .38rem .35rem;
      background-color: #fff;

      .file-upload {
        display: none;
      }

      .btn-upload {
        .upload-item;
        background: url("../assets/images/btn-upload.png") center center no-repeat;
        background-size: 1.2rem 1.2rem;
      }

      .upload-item {
        .upload-item;

        .btn-del {
          display: block;
          width: .42rem;
          height: .42rem;
          top: 0;
          right: 0;
          z-index: 1;
          background: url("../assets/images/close.png") center center no-repeat;
          background-size: .14rem .14rem;
        }

        .icon-file {
          display: block;
          width: .96rem;
          height: 1.06rem;
          margin: .24rem auto 0 auto;
          background: url("../assets/images/icon-word.png") 0 0 no-repeat;
          background-size: 100% 100%;

          &.doc {
            background-image: url("../assets/images/icon-word.png");
          }
          &.ppt {
            background-image: url("../assets/images/icon-ppt.png");
          }
          &.excel {
            background-image: url("../assets/images/icon-excel.png");
          }
          &.pdf {
            background-image: url("../assets/images/icon-pdf.png");
          }
        }

        .file-name {
          padding: .14rem .18rem 0 .18rem;
          font-size: .2rem;
          color: #c3c3c3;
          line-height: .24rem;
        }
      }
    }
    .upload-info {
      .wrap;
      padding-bottom: .3rem;
      font-size: .24rem;
      color: #262626;
      line-height: .3rem;
      background-color: #fff;
    }
    .tip {
      display: flex;
      height: 1.38rem;
      .wrap;
      align-items: center;
      border-top: 1px solid #e7e7e7;
      border-bottom: 1px solid #e7e7e7;

      .icon {
        flex: none;
        width: 1.05rem;
        height: 1.05rem;
        margin-right: .18rem;
        border-radius: 50%;
        background: #fdcd09 url("../assets/images/tip.png") center center no-repeat;
        background-size: .59rem .69rem;
      }

      .tip-text {
        font-size: .24rem;
        color: #949494;
        line-height: .36rem;
        
        i {
          font-weight: bold;
        }
      }
    }
    .public-file {
      display: flex;
      height: 1.1rem;
      .wrap;
      align-items: center;
      justify-content: space-between;
      background-color: #fff;

      .info {
        font-size: .32rem;
        color: #262626;
      }
    }
    .public-info {
      .wrap;
      padding-top: .18rem;
      font-size: .24rem;
      color: #949494;
      line-height: .36rem;
    }
    .type-info {
      .wrap;
      margin-top: .5rem;
      font-size: .24rem;
      color: #000;
      line-height: .58rem;
    }
  }
}
</style>
<style lang="less">
.field-picker-box {
  background-color: #fff;
  .field-picker::after {
    display: none;
  }
}
</style>

