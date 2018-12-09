<template>
  <div class="create-plan">
    <my-header title="新建方案" @nextStep="nextStep"></my-header>
    <div class="content">
      <div class="challenge-title pr">
        {{plan.questionTitle}}
        <span class="title-label pa">挑战</span>
      </div>
      <div class="form-ipt">
        <input type="text" class="tit-ipt" v-model="planTitle" placeholder="请输入方案的标题">
        <custom-editor
          ref="customEditor"
          @change="contentChange"
          @videoUploadBtnHide="videoUploadBtnShow = false"
          @videoUploadBtnShow="videoUploadBtnShow = true"
        ></custom-editor>
      </div>
    </div>
    <div class="fixbar">
      <div class="fix">
        <mt-button @click="$refs.customEditor.pick()">
          <img src="../assets/images/icon-img.png" slot="icon" >
          添加图片
        </mt-button>
        <mt-button
          v-if="videoUploadBtnShow"
          @click="$refs.customEditor.videoUpload()">
          <img src="../assets/images/icon-video-upload.png" slot="icon" >
          添加视频
        </mt-button>
        <div class="info-box">
          <p class="info-item">- 请表述您的方案相对现状有怎样的提升？预期达到的结果是什么？如果可能，请量化预期结果</p>
          <p class="info-item">- 方案应用前景和挑战是什么？</p>
          <p class="info-item">- 请表述如何使创新想法落地实施，需要什么样的资源 (例如：资金, 培训, 团队资源, etc.)</p>
        </div>
      </div>
      <div class="fix">
        <div class="squad r">
          开启组队
          <mt-switch v-model="vsSquadFlag" class="r"></mt-switch>
        </div>
      </div>
      <div class="info-box">
        <p class="info-item">提示：开启功能后，该挑战将开放组队报名，员工点击报名后，创委会在后台收到报名数据</p>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import {mapState, mapMutations} from 'vuex'
import shortid from 'js-shortid'
import http from '../utils/http.js'
import api from '../utils/api.js'
import CustomWangEditor from './CustomWangEditor'

export default {
  components: {
    'custom-editor': CustomWangEditor
  },
  created(){
    let planId = this.$route.query.planId
    if(planId){
      this.createMode = 'update'
      this.updateState({planId: planId})
      Object.assign(this.$data,this.$store.state.plan)
      this.answerContent = this.answerContent.replace(/style=".*?"/g,'')
      this.oldImgIds = this.getIdsFromStr(this.answerContent)
    } else {
      this.createMode = 'new'
      this.updateState({planId: shortid.gen()})
    }
    this.GetPlanDraftByparentId()
    this.vsSquadFlag = this.plan.vsSquadFlag == '1' ? true : false
  },
  data() {
    return {
      vsSquadFlag: false,
      imgList: [],
      planTitle: '',
      answerContent: '',
      createMode: '',
      delImgIds: '',
      videoUploadBtnShow: true
    }
  },
  computed: {
    ...mapState(['sid','planId','plan'])
  },
  watch: {
    planTitle: _.throttle(function() {
      this.saveDraft()
    },1000)
  },
  methods: {
    ...mapMutations(['incrementPlan','updateState']),
    contentChange (val) {
      if (val.indexOf('btn-play') < 0) {
        this.videoUploadBtnShow = true
      }
      this.answerContent = val
      this.saveDraft()
    },
    async nextStep(){
      this.answerContent = this.answerContent.replace(/style=".*?"/g,'')
      if(this.trim(this.planTitle) === ''){
        return this.showToast('方案标题 是必须的')
      }
      if(this.delHtmlTag(this.answerContent) === ''){
        return this.showToast('方案描述 是必须的')
      }
      if(this.$route.query.planId){
        if(this.oldImgIds.length){
          let newImgIds = this.getIdsFromStr(this.answerContent)
          if(newImgIds.length){
            this.delImgIds = []
            this.oldImgIds.map(item => {
              if(newImgIds.indexOf(item) < 0){
                this.delImgIds.push(item)
              }
            })
          } else {
            this.delImgIds = this.oldImgIds
          }
        } else {
          this.delImgIds = ''
        }
      }
      this.incrementPlan(this.match(this.$data,['planTitle', 'answerContent', 'vsSquadFlag', 'delImgIds']))
      if(this.$route.query.planId){
        this.$router.push(`/addfile?planId=${this.$route.query.planId}`)
      } else {
        this.$router.push('/addfile')
      }
    },
    async GetPlanDraftByparentId() {
      this.showLoading()
      let params = {
        fkeyType: 10,
        parentId: this.plan.questionId
      }
      if(this.createMode == 'update') params['fkeyId'] = this.planId
      let res = await http.post(params,this.createMode == 'update' ? api.getDraftByTypeId : api.GetPlanDraftByparentId)
      this.hideLoading()
      if(res.data.errormsg === ''){
        let draftData = res.data.data
        if(!(!draftData && typeof(draftData)!="undefined" && draftData!=0)){
          this.planTitle = draftData.fkeyTitle
          this.answerContent = draftData.fkeyContent
          this.incrementPlan({draftId: draftData.id})
          this.$nextTick(() => {
            this.$refs.customEditor.initVal(draftData.fkeyContent)
          })
        }
      } else {
        return this.showAlert(res.data.errormsg)
      }
    },
    saveDraft: _.throttle(async function() {
      let {data} = await http.post({
        fkeyId: this.createMode === 'new' ? '' : this.planId,
        fkeyType: 10,
        fkeyTitle: this.planTitle,
        fkeyContent: this.answerContent,
        coverImgBase64: '',
        parentId: this.plan.questionId
      }, api.saveDraft)
    },1000),
    delHtmlTag(str){
      return str.replace(/<[^>]+>/g,"")
    },
    getIdsFromStr(str) {
      let imgReg = /<img.*?(?:>|\/>)/gi;
      let srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
      let idReg = /data-id=[\'\"]?([^\'\"]*)[\'\"]?/i;
      let arr = str.match(imgReg);  // arr 为包含所有img标签的数组
      let result = []
      if(arr) {
        for (let i = 0; i < arr.length; i++) {
          let id = arr[i].match(idReg);
          //获取图片地址
          result.push(id[1])
        }
        return result
      } else {
        return []
      }
    }
  }
}
</script>

<style scoped lang="less">
.challenge-title {
  padding: .44rem .24rem .34rem .83rem;
  border-bottom: 1px solid #eee;
  font-size: .36rem;
  color: #262626;
  font-weight: bold;
  line-height: .42rem;

  .title-label {
    top: .4rem;
    left: 0;
    height: .5rem;
    padding: 0 .1rem;
    font-size: .24rem;
    color: #fff;
    font-weight: bold;
    line-height: .5rem;
    border-top-right-radius: .14rem;
    border-bottom-right-radius: .14rem;
    background-color: #ff3c00;
  }
}
.form-ipt {
  box-sizing: border-box;
  width: 100%;
  padding: 0 0 5.1rem .45rem;
  color: #262626;
  overflow-x: hidden;

  .tit-ipt {
    display: block;
    width: 100%;
    height: .86rem;
    border: none;
    border-bottom:  1px solid #eee;
    font-size: .36rem;
    font-weight: bold;
    outline: none;

    &::-webkit-input-placeholder {
      color: #b5b5b5;
    }
  }
  .detail-ipt {
    margin: 0;
    padding: .12rem .24rem .12rem 0;
    border: none;
    outline: none;
    font-size: .26rem;
    line-height: .42rem;
  }
}
.fixbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3;
  border-top: 1px solid #eee;
  font-size: .32rem;
  color: #444;
  line-height: 1rem;
  background-color: #fff;

  .mint-button--normal {
    padding: 0 .36rem;
    font-size: .28rem;
    line-height: 1rem;
    background-color: transparent;
    box-shadow: none;
    -webkit-box-shadow: none;

    .mint-button-icon img{
      width: .44rem;
      height: .42rem;
      margin-top: .28rem;
    }

    &:active::after {
      background-color: transparent;
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

  .mint-switch {
    margin: .18rem .38rem 0 .2rem;
  }
}
</style>
