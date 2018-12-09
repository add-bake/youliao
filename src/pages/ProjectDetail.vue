<template>
  <div class="plan-detail">
    <my-header title="" rightButton="" leftBtnStyle="icon"></my-header>
    <no-data v-if="loading" iconType="3" text="努力加载中..."></no-data>
    <no-data v-if="!projectDetail && !loading" text="暂无数据~"></no-data>
    <div v-if="!loading && projectDetail">
      <div class="title pr el">
        <span class="title-label pa">项目</span>
        {{projectDetail.projectTitle}}
      </div>
      <div class="tool-box">
        <div class="tool-item upvote" :class="{cur: projectDetail.isUpvote}" @click="upvote">
          <span class="item-icon"></span>
          点赞 {{projectDetail.upvoteCount}}
        </div>
        <div class="tool-item comment" @click="toComment(projectDetail.id)">
          <span class="item-icon"></span>
          评论 {{projectDetail.criticizeCount}}
        </div>
        <div class="tool-item join-apply" :class="{cur: projectDetail.isApplyParticipative}"  @click="joinApply(projectDetail.id, projectDetail.projectTitle)">
          <span class="item-icon"></span>
          {{projectDetail.isApplyParticipative ? '已申请' : '我想参与'}}
        </div>
      </div>
      <div class="plan-detail-info">
        <div class="top-link wrap tc" :class="{disabled: !projectDetail.planeurl}" @click="toPlanDetail">查看原方案链接</div>
        <img class="item-img" :src="`${baseUrl}${projectDetail.projectCoverpicture}`" :onerror="defaultImg">
        <div class="wrap">
          <p class="title-item">项目描述</p>
          <div class="project-info" v-html="projectDetail.projectDescription"></div>
          <video-popup
            btnShow
            :id="projectDetail.video ? projectDetail.video.id : ''"
            :videoUrl="projectDetail.video ? projectDetail.video.aliyunVideoUrl : ''"
            :videoPoster="projectDetail.video ? projectDetail.video.img : ''">
          </video-popup>
          <p class="nomore-data tc" v-if="!projectDetail.projectDescription.length">暂无数据</p>
          <p class="title-item">项目进度</p>
          <div class="rate-box">
            <div class="rate-item pr" v-for="(item, index) in projectProgress" :class="{cur: projectDetail.projectProgressDetails[index]}">
              <p class="item-text fix pr">
                {{item}}
                <span class="item-date r" v-if="projectDetail.projectProgressDetails[index]">{{dateFormat(projectDetail.projectProgressDetails[index].progressEndDate)}}</span>
              </p>
            </div>
          </div>
          <p class="title-item">项目团队</p>
        </div>
        <div class="project-member">
          <div class="member-item-box wrap pr">
            <p class="member-item-title">DRI:</p>  
            <div class="member-item-content">
              <p class="member-item cur l" v-for="item in team.dpi" :key="item.id" @click="popupControl(item.memberName,item.memberDescription)">{{item.memberName}}</p>
            </div>
          </div>
          <div class="member-item-box wrap pr">
            <p class="member-item-title">PMO:</p>  
            <div class="member-item-content">
              <p class="member-item cur l" v-for="item in team.pmo" :key="item.id" @click="popupControl(item.memberName,item.memberDescription)">{{item.memberName}}</p>
            </div>
          </div>
          <div class="member-item-box wrap pr">
            <p class="member-item-title">项目组长:</p>  
            <div class="member-item-content">
              <p class="member-item cur l" v-for="item in team.leaders" :key="item.id" @click="popupControl(item.memberName,item.memberDescription)">{{item.memberName}}</p>
            </div>
          </div>
          <div class="member-item-box wrap pr">
            <p class="member-item-title">项目成员:</p>  
            <div class="member-item-content">
              <p class="member-item l" v-for="item in team.members" :key="item.id">{{item.memberName}}</p>
            </div>
          </div>
        </div>
        <p class="title-item wrap">项目附件</p>
        <div class="file-list">
          <div class="file-item pr el" v-for="item in projectDetail.projectFiles" :key="item.id" :class="typeHandle(item.fileUrl)" @click="openFile(item.fileUrl)">
            {{item.fileName}}
            <span class="arrow pa"></span>
          </div>
          <p class="nomore-data tc" v-if="!projectDetail.projectFiles.length">暂无数据</p>
        </div> 
      </div>
      <div class="popup" v-show="popupParams.popupShow" :class="{cur: popupParams.popupAnimate}">
        <p class="popup-title wrap el">{{popupTitle}}</p>
        <div class="popup-content" v-html="popupInfo"></div>
        <div class="popup-close" @click="popupClose"></div>
      </div>
      <div class="popup-backdrop" :class="{cur: popupParams.popupBackdropAnimate}"></div>
    </div>
  </div>
</template>

<script>
import NoData from '../components/NoData'
import { mapState , mapMutations } from 'vuex'
import http from '../utils/http.js'
import api from '../utils/api.js'
import dayjs from 'dayjs'
import VideoPopup from '../components/VideoPopup'

export default {
  components: {
    'no-data': NoData,
    VideoPopup
  },
  data() {
    return {
      loading: true,
      projectDetail: {},
      defaultImg: 'this.src="'+ require('../assets/images/default-img.png') +'"',
      popupParams: {
        popupBackdropAnimate: false,
        popupShow: false,
        popupAnimate: false
      },
      team: {
        dpi: [],
        pmo: [],
        leaders: [],
        members: []
      },
      popupTitle: '',
      popupInfo: '',
      projectProgress: ['立项', '孵化', '全面开启', '项目跟踪', '项目完成']
    }
  },
  created() {
    this.updateState(this.$route.query)
    this.getData()
  },
  computed: {
    ...mapState(['baseUrl', 'defaultHeadImg', 'sid', 'uid', 'platform'])
  },
  methods:{
    ...mapMutations(['updateState']),
    async getData () {
      let res = await http.post({
        projectId: this.$route.query.id
      },api.getProjectDetail)
      this.loading = false
      if(res.data.errormsg === ''){
        let detailData = res.data.data
        if (!detailData) return this.showAlert('该项目详情数据为空',() => this.$router.go(-1))
        this.projectDetail = detailData
        if (detailData.projectMembers.length) {
          let teamLeaders = []
          detailData.projectMembers.map(item => {
            switch (item.memberType) {
              case '1':
                this.team['dpi'].push(item)
                break
              case '2':
                this.team['pmo'].push(item)
                break
              case '3':
                teamLeaders.push(item)
                break
              case '4':
                this.team['members'].push(item)
                break
            }
          })
          if (teamLeaders.length) {
            this.team['leaders'] = teamLeaders.sort(this.leaderCompare('memberSort'))
          }
        }
      } else {
        this.projectDetail = ''
        this.showAlert(res.data.errormsg)
      }
    },
    dateFormat(param){
      return dayjs(param).format('YYYY-MM-DD')
    },
    async joinApply(id,title){
      if(this.projectDetail.isApplyParticipative) return
      this.showLoading()
      let res = await http.post({
        type: 4, //1挑战 2方案 4项目
        fkeyId: id,
        title: title,
        userId: null,
        petName: null,
        name: null
      },api.insertApplyParticipative)
      this.hideLoading()
      if(res.data.errormsg === ''){
        this.showAlert('参与成功')
        this.projectDetail.isApplyParticipative = true
      } else {
        this.showAlert(res.data.errormsg)
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
      this.showLoading()
      let res = await http.post({
        type: '6',
        fkeyId: this.projectDetail.id
      },api.dealUpvote)
      this.hideLoading()
      this.loading = false;
      if(res.data.errormsg === ''){
        this.projectDetail.isUpvote = !this.projectDetail.isUpvote
        if(this.projectDetail.isUpvote){
          this.projectDetail.upvoteCount++
        } else {
          if(this.projectDetail.upvoteCount == '0') return
          this.projectDetail.upvoteCount--
        }
      } else {
        this.showToast(res.data.errormsg)
      }
    },
    toComment (id) {
      if(this.platform == 1){
        this.$router.push({path: '/project/comment', query: {id: id}})
      } else {
        youliao.AppCommentListHandler(`/project/comment?id=${id}`)
      }
    },
    toPlanDetail () {
      if (!this.projectDetail.planeurl) return;
      this.$router.push({path: '/plandetail', query: {id: this.projectDetail.planeurl}})
    },
    popupControl (name,info) {
      this.popupTitle = name
      this.popupInfo = info
      this.popupParams['popupShow'] = true
      setTimeout(() => {
        this.popupParams['popupAnimate'] = true
        this.popupParams['popupBackdropAnimate'] = true
      },10)
    },
    popupClose () {
      this.popupParams['popupAnimate'] = false
      this.popupParams['popupBackdropAnimate'] = false
      setTimeout(() => {
        this.popupParams['popupShow'] = false
      },400)
    },
    openFile(url) {
      if (this.platform == 1) {
        this.$router.push({path: '/file', query: {url: url}})
      } else {
        youliao.AppReadAttachmentHandler(`https://view.officeapps.live.com/op/view.aspx?src=${this.baseUrl}${url}`)
      }
    },
    leaderCompare(property){
      return (obj1,obj2) => {
        let value1 = obj1[property]
        let value2 = obj2[property]
        return value1 - value2
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
  background-color: #00b4ff;
}
.plan-detail {
  height: 100%;

  .title {
    position: fixed;
    top: .7rem;
    left: 0;
    right: 0;
    z-index: 15;
    height: 1.1rem;
    padding: 0 .3rem 0 .8rem;
    border-top: 1px solid #eee;
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
    padding-top: 1.8rem;
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
    .top-link {
      display: block;
      font-size: .3rem;
      color: #00b4ff;
      line-height: .66rem;
      &.disabled {
        color: #505050;
      }
    }
    .wrap {
      padding: 0 .3rem;
    }
    .title-item {
      margin-top: .2rem;
      font-size: .32rem;
      color: #00b4ff;
      line-height: .84rem;
      font-weight: bold;
    }
    .project-info {
      padding-top: .12rem;
      font-size: .3rem;
      color: #252525;
      line-height: .48rem;
    }
    .rate-item {
      height: .72rem;
      padding: .13rem 0 .13rem .46rem;
      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        z-index: 1;
        width: .2rem;
        height: .2rem;
        margin-top: -.1rem;
        border-radius: 50%;
        background-color: #c8c8c8;
      }
      &::after {
        content: '';
        position: absolute;
        top: .63rem;
        left: .08rem;
        z-index: 1;
        width: .04rem;
        height: .71rem;
        background-color: #6d6d6d;
      }
      &:last-child::after {
        display: none;
      }
      .item-text {
        height: 100%;
        padding: 0 .25rem 0 .29rem;
        border-radius: .1rem;
        font-size: .3rem;
        color: #fff;
        line-height: .71rem;
        background-color: #c8c8c8;
        .item-date {
          font-size: .24rem;
        }
        &::before {
          content: '';
          position: absolute;
          top: 50%;
          left: -.17rem;
          z-index: 1;
          width: 0;
          height: 0;
          margin-top: -.1rem;
          border-right: .17rem solid #c8c8c8;
          border-top: .1rem solid transparent;
          border-bottom: .1rem solid transparent;
        }
      }
      &.cur {
        &::before,
        .item-text {
          background-color: #00b4ff;
        }
        .item-text::before {
          border-right-color: #00b4ff;
        }
      }
    }
    .member-item-box {
      display: flex;
      padding-top: .1rem;
      padding-bottom: .1rem;
      &::after {
        content: '';
        position: absolute;
        left: .2rem;
        right: 0;
        bottom: 0;
        height: .02rem;
        background-color: #c8c8c8;
      }
      .member-item-title {
        flex: none;
        width: 1.74rem;
        font-size: .3rem;
        color: #000;
        line-height: .74rem
      }
      .member-item-content {
        flex: 1;
        .member-item {
          margin: .1rem .2rem .1rem 0;
          padding: 0 .24rem;
          border: 2px solid #00b4ff;
          border-radius: .1rem;
          font-size: .3rem;
          color: #00b4ff;
          line-height: .5rem;
          &.cur {
            position: relative;
            margin-right: .3rem;
            padding-right: .52rem;
            color: #fff;
            background: #00b4ff url("../assets/images/icon-arrow.png") right center no-repeat;
            background-size: .31rem .31rem;
            &::after {
              content: '';
              position: absolute;
              width: .5rem;
              top: -2px;
              bottom: -2px;
              right: -.1rem;
              z-index: -1;
              border-top-right-radius: .1rem;
              border-bottom-right-radius: .1rem;
              background-color: #00b4ff;
            }
          }
        }
      }
    }
    .file-list {
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
.popup-backdrop {
  top: .7rem;
}
</style>
