<template>
  <div class="plan-detail">
    <my-header title="" rightButton="" leftBtnStyle="icon"></my-header>
    <div class="title pr el">
      <span class="title-label pa">挑战</span>
      {{planDetail.questionTitle}}
    </div>
    <div class="tool-box">
      <div class="tool-item upvote" :class="{cur: planDetail.isUpvote}" @click="upvote">
        <span class="item-icon"></span>
        点赞 {{planDetail.upvoteCount}}
      </div>
      <div class="tool-item comment" @click="toComment(planDetail.id)">
        <span class="item-icon"></span>
        评论 {{planDetail.criticizeCount}}
      </div>
      <div class="tool-item join-apply" v-if="planDetail.vsSquadFlag == '1'" :class="{cur: planDetail.isApplyParticipative}"  @click="joinApply(planDetail.id, planDetail.planTitle)">
        <span class="item-icon"></span>
        {{planDetail.isApplyParticipative ? '已申请' : '我想参与'}}
      </div>
    </div>
    <div class="plan-detail-info">
      <div class="title pr">
        <span class="title-label pa">方案</span>
        {{planDetail.planTitle}}
      </div>
      <div class="wrap">
        <div class="user-info fix">
          <img class="user-head l" :src="`${baseUrl}${planDetail.userPhoto}`" :onerror="defaultHeadImg">
          <div class="l">
            <p class="name el">{{planDetail.userPetname}}</p>
            <p class="date el">{{dateFormat(planDetail.updateDate)}}</p>
          </div>
          <div class="btn r" v-if="editShow" @click="editPlan">编辑方案</div>
        </div>
        <div class="plan-content" @click="playVideo($event)" v-html="planDetail.answerContent"></div>
      </div>
      <div class="file-list" v-if="fileShow">
        <div class="file-item pr el" v-for="item in planDetail.answerPlanFileList" :key="item.id" :class="typeHandle(item.fileUrl)" @click="openFile(item.fileUrl)">
          <!-- <a :href="`https://view.officeapps.live.com/op/view.aspx?src=${baseUrl}/${item.fileUrl}`" target="_blank"> -->
            {{item.fileName}}
            <span class="arrow pa"></span>
          <!-- </a> -->
        </div>
      </div> 
    </div>
    <video-popup
      ref="videoPopup"
      :id="planDetail.video ? planDetail.video.id : ''"
      :videoUrl="planDetail.video ? planDetail.video.aliyunVideoUrl : ''"
      :videoPoster="planDetail.video ? planDetail.video.img : ''">
    </video-popup>
  </div>
</template>

<script>
import { mapState , mapMutations } from 'vuex'
import http from '../utils/http.js'
import api from '../utils/api.js'
import dayjs from 'dayjs'
import VideoPopup from './VideoPopup'

export default {
  components: {
    VideoPopup
  },
  data() {
    return {
      challengeTitle: '加载中...',
      planDetail: {},
      editShow: false,
      fileShow: false //附件是否显示
    }
  },
  created() {
    if(!this.sid){
      this.updateState({
        sid: this.$route.query.sid
      })
    }
    if(this.$route.query.platform == 1){
      this.updateState({platform: 1})
    }
    if(this.$route.query.uid){
      this.updateState({uid: this.$route.query.uid})
    }
    this.getData()
  },
  computed: {
    ...mapState(['baseUrl','defaultHeadImg','sid','uid', 'platform', 'defaultImg'])
  },
  methods:{
    ...mapMutations(['incrementPlan','updateState']),
    async getData() {
      this.showLoading()
      let res = await http.post({
        planId: this.$route.query.id
      },api.getPlanInfoById)
      let officialFolk = await http.get(api.getLoginUserIsOfficial,{
        __sid: this.sid
      })
      this.hideLoading()
      this.loading = false;
      if(res.data.errormsg === ''){
        this.planDetail = res.data.data
        if(res.data.data.userId == this.uid) this.editShow = true
        if(res.data.data.publicFlagFile == 1 || officialFolk.data.data){
          this.fileShow = true
        }
      } else {
        this.showToast(res.data.errormsg)
      }
    },
    dateFormat(param){
      return dayjs(param).format('YYYY-MM-DD')
    },
    playVideo (event) {
      if (this.hasClass(event.target, 'btn-play')) {
        this.$refs.videoPopup.popupShowControl()
      }
    },
    async joinApply(id,title){
      if(this.planDetail.isApplyParticipative) return
      this.showLoading()
      let res = await http.post({
        type: 2, //1挑战 2方案
        fkeyId: id,
        title: title,
        userId: null,
        petName: null,
        name: null
      },api.insertApplyParticipative)
      this.hideLoading()
      if(res.data.errormsg === ''){
        this.showAlert('参与成功')
        this.planDetail.isApplyParticipative = true
      } else {
        this.showAlert(res.data.errormsg)
      }
    },
    toComment (id) {
      if(this.platform == 1){
        this.$router.push({path: '/commentlist', query: {id: id}})
      } else {
        youliao.AppCommentListHandler(`/commentlist?id=${id}`)
      }
    },
    typeHandle(fileUrl) {
      let fileType =  fileUrl.substring(fileUrl.lastIndexOf(".")+1).toLowerCase()
      switch(fileType){
        case 'docx':
          return 'doc'
          break;
        case 'pptx':
          return 'ppt'
          break;
        case 'xlsx':
          return 'xls'
          break;
        default:
          return fileType
      }
    },
    async upvote() {
      if(this.editShow) return
      this.showLoading()
      let res = await http.post({
        type: '3',
        fkeyId: this.planDetail.id
      },api.dealUpvote)
      this.hideLoading()
      this.loading = false;
      if(res.data.errormsg === ''){
        this.planDetail.isUpvote = !this.planDetail.isUpvote
        if(this.planDetail.isUpvote){
          this.planDetail.upvoteCount++
        } else {
          if(this.planDetail.upvoteCount == '0') return
          this.planDetail.upvoteCount--
        }
      } else {
        this.showToast(res.data.errormsg)
      }
    },
    editPlan() {
      this.incrementPlan(Object.assign({
        isPublicFile: this.planDetail.publicFlagFile === '1' ? true : false,
        vsSquadFlag: this.planDetail.vsSquadFlag === '1' ? true : false,
      },this.match(this.planDetail,['answerContent', 'planTitle','technologyId','technologyText','answerPlanFileList','questionTitle'])))
      this.$router.push({path: '/createplan',query:{planId: this.planDetail.id}})
    },
    openFile(url) {
      if (this.platform == 1) {
        this.$router.push({path: '/file', query: {url: url}})
      } else {
        youliao.AppReadAttachmentHandler(`https://view.officeapps.live.com/op/view.aspx?src=${this.baseUrl}${url}`)
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
.title-label(){
  top: 50%;
  left: 0;
  height: .5rem;
  margin-top: -.25rem; 
  padding: 0 .1rem;
  font-size: .24rem;
  color: #fff;
  font-weight: bold;
  line-height: .5rem;
  border-top-right-radius: .14rem;
  border-bottom-right-radius: .14rem;
  background-color: #ff3c00;
}
.plan-detail {
  height: 100%;

  .title {
    position: fixed;
    top: .4rem;
    left: 0;
    right: 0;
    z-index: 15;
    height: 1.1rem;
    padding: 0 .3rem 0 .8rem;
    font-size: .36rem;
    color: #262626;
    line-height: 1.1rem;
    font-weight: bold;
    background-color: #fff;
    box-shadow: 0 .03rem .16rem rgba(13, 4, 8, .18);

    .title-label {
      .title-label();
    }
  }
  .tool-box {
    display: flex;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 15;
    height: .98rem;
    font-size: .3rem;
    color: #252525;
    line-height: .98rem;
    background-color: #fff;
    box-shadow: 0 -.17rem .16rem rgba(13, 4, 9, .02);
    .tool-item {
      flex: none;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 33.3333333333333333%;
      .item-icon {
        display: inline-block;
        width: .36rem;
        height: .36rem;
        margin-right: .16rem;
        background: url("../assets/images/upvote.png") center center no-repeat;
        background-size: .36rem .36rem;
      }
      &.upvote.cur .item-icon {
        background-image: url("../assets/images/upvote-cur.png");
      }
      &.comment {
        .item-icon {
          width: .35rem;
          height: .37rem;
          background-image: url("../assets/images/icon-comment.png");
          background-size: .35rem .37rem;
        }
      }
      &.join-apply {
        .item-icon {
          background-image: url("../assets/images/apply.png");
        }
        &.cur .item-icon {
          background-image: url("../assets/images/apply-cur.png");
        }
      }
    }
  }
  .plan-detail-info {
    padding-top: 1.5rem;
    padding-bottom: 1.3rem;
    .title {
      position: relative;
      top: 0;
      z-index: 1;
      height: auto;
      padding-top: .3rem;
      padding-bottom: .3rem;
      line-height: .5rem;
      box-shadow: none;
      .title-label {
        top: .3rem;
        margin-top: 0;
        background-color: #95dc48;
      }
    }
    .wrap {
      padding: 0 .3rem;
      .user-info {
        .user-head {
          width: .64rem;
          height: .64rem;
          margin-right: .24rem;
          border-radius: 50%;
        }
        .name {
          max-width: 4.3rem;
          font-size: .24rem;
          color: #252525;
          line-height: .3rem;
        }
        .date {
          font-size: .24rem;
          color: #8c8c8c;
          line-height: .36rem;
        }
        .btn {
          height: .54rem;
          padding: 0 .13rem 0 .46rem;
          margin: .05rem 0;
          border-radius: .06rem;
          font-size: .24rem;
          color: #fff;
          line-height: .54rem;
          background: #95dc48 url("../assets/images/icon-edit.png") .14rem center no-repeat;
          background-size: .24rem;
        }
      }
      .plan-content {
        padding-top: .12rem;
        font-size: .3rem;
        color: #252525;
        line-height: .48rem;
      }
    }
    .file-list {
      margin-top: .36rem;
      border-top: .02rem solid #ebebeb;
      .file-item {
        height: 1.04rem;
        padding: 0 .8rem 0 1.3rem;
        border-bottom: .02rem solid #ebebeb;
        font-size: .3rem;
        color: #252525;
        line-height: 1.04rem;
        background: url("../assets/images/icon-word.png") .33rem center no-repeat;
        background-size: .7rem .77rem;
        a {
          display: block;
          width: 100%;
          height: 100%;
          color: #252525;
        }
        &.doc {
          background-image: url("../assets/images/icon-word.png");
        }
        &.ppt {
          background-image: url("../assets/images/icon-ppt.png");
        }
        &.xls {
          background-image: url("../assets/images/icon-excel.png");
        }
        &.pdf {
          background-image: url("../assets/images/icon-pdf.png");
        }
        .arrow {
          top: 50%;
          right: .3rem;
          z-index: 1;
          width: .15rem;
          height: .26rem;
          margin-top: -.13rem;
          background: url("../assets/images/arrow-right.png") 0 0 no-repeat;
          background-size: 100% 100%;
        }
      }
    }
  }
}
</style>
<style lang="less">
.plan-detail {
  .mint-header {
    height: .7rem;
    border: none!important;
    .mint-button-icon .mintui {
      font-size: .32rem;
      color: #252525;
    }
  }
}
</style>
