<template>
  <div class="challenge-detail">
    <my-header title="" rightButton="" leftBtnStyle="icon"></my-header>
    <div class="content list-wrap pr">
      <no-data v-if="loading" iconType="3" text="努力加载中..."></no-data>
      <div class="challenge-item" v-show="challenge">
        <div class="item-label fix">
          <span>{{challenge.departmentText}}</span><span>{{challenge.innovateText}}</span>
        </div>
        <div class="item-title pr">
          {{challenge.questionTitle}}
          <span class="title-label pa">挑战</span>
        </div>
        <ellipsis :introduce="challenge.questionContent" :imgList="challenge.questionImagelistImages"></ellipsis>
        <video-popup
          btnShow
          :id="challenge.video ? challenge.video.id : ''"
          :videoUrl="challenge.video ? challenge.video.aliyunVideoUrl : ''"
          :videoPoster="challenge.video ? challenge.video.img : ''">
        </video-popup>
        <div class="item-info fix">
          <span class="bold" :class="{red: challenge.isUpvote}" @click="upvote">{{challenge.upvoteCount || 0}}</span>
          <span :class="{red: challenge.isUpvote}" @click="upvote">赞</span>
          <span class="spot"></span>
          <span class="bold">{{challenge.viewCount || 0}}</span>
          <span>浏览</span>
          <span class="spot"></span>
          <span class="date">{{dateFormat(challenge.vsEndDate)}} 结束</span>
          <div class="btn r" v-if="challenge.vsSquadFlag == '1'" :class="{disabled: challenge.isApplyParticipative}" @click="joinApply(challenge.id, challenge.questionTitle)">{{challenge.isApplyParticipative ? '已申请' : '申请参与'}}</div>
        </div>
      </div>
      <div class="screen-area pr">
        <p class="count pa">{{challenge.answerCount || 0}} 个方案</p>
        <screen-bar
          screenHide
          technologyShow
          :sortCheck="sortCheck"
          @sortChange="sortChange"
          ref="screenBar">
        </screen-bar>
      </div>
      <no-data v-if="!list.length && allLoaded" iconType="2" text="暂时还没用户提交方案"></no-data>
      <mt-loadmore :top-method="loadTop" :bottom-method="loadBottom" :bottom-all-loaded="allLoaded" ref="loadmore">
        <ul v-if="list.length">
          <li v-for="item in list" :key="item.id" class="challenge-item solution" @click="toPlanDetail(item.id)">
            <div class="author-info fix el">
              <img :src="`${baseUrl}${item.userPhoto}`" :onerror="defaultHeadImg" class="l">
              {{item.userPetname}}
            </div>
            <div class="item-title pr">
              {{item.planTitle}}
              <span class="title-label pa">方案</span>
            </div>
            <p class="item-text ellipsis" v-html="filterHtmlTag(item.answerEditedcontent)"></p>
            <div class="item-info fix">
              <span class="bold">{{item.criticizeCount || 0}}</span>
              <span>评论</span>
              <span class="spot"></span>
              <span class="bold">{{item.upvoteCount || 0}}</span>
              <span>赞同</span>
              <span class="spot"></span>
              <span class="date">{{dateFormat(item.createDate)}}</span>
            </div>
          </li>
        </ul>
      </mt-loadmore>
      <p class="nomore-data" v-if="allLoaded && list.length">暂无更多数据</p>
      <div class="challenge-entry plan-entry" @click="createPlan">方案</div>
    </div>
  </div>
</template>

<script>
import ScreenBar from './ScreenBar'
import Ellipsis from './Ellipsis'
import VideoPopup from './VideoPopup'
import NoData from './NoData'
import http from '../utils/http.js'
import api from '../utils/api.js'
import dayjs from 'dayjs'
import { mapState, mapMutations } from 'vuex'

export default {
  components: {
    'screen-bar': ScreenBar,
    'no-data': NoData,
    'ellipsis': Ellipsis,
    VideoPopup
  },
  computed: {
    ...mapState(['baseUrl','defaultHeadImg','sid'])
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
  },
  data() {
    return {
      loading: false,
      challenge: '',
      defaultImg: 'this.src="'+ require('../assets/images/default-img.png') +'"',
      sortCheck: {
        text: '时间排序',
        value: '5'
      },
      sortMethod: '5',
      pageIndex: 0,
      pageSize: '10',
      list: [],
      allLoaded: false,
      couldUpvote: false //是否可以点赞
    }
  },
  methods: {
    ...mapMutations(['incrementPlan','updateState','uid']),
    loadTop() {
      this.pageIndex = 0
      this.list = []
      this.loadBottom()
      this.$refs.loadmore.onTopLoaded();
    },
    sortChange(val) {
      this.sortCheck = val
      this.sortMethod = val.value
    },
    createPlan() {
      this.incrementPlan(Object.assign({
        questionId: this.challenge.id
      },this.match(this.challenge,['questionTitle', 'departmentText','innovateText','departmentId','innovateId'])))
      this.$router.push('/createplan')
    },
    toPlanDetail(id) {
      this.incrementPlan(Object.assign({
        questionId: id
      },this.match(this.challenge,['questionTitle', 'departmentText','innovateText','departmentId','innovateId'])))
      this.$router.push({path: '/plandetail',query: {id: id}})
    },
    async loadBottom() {
      this.loading = true
      let challengeData = null
      if(!this.challenge){
        challengeData = await http.post({
          id: this.$route.query.id
        },api.getVersusInfo)
      }
      let planList = await http.post({
        pageIndex: ++this.pageIndex,
        pageSize: this.pageSize,
        VersusId: this.$route.query.id,
        sortMethod: this.sortMethod
      },api.getPlanListByBelongVersus)
      this.loading = false
      
      if(!this.challenge){
        if(challengeData.data.errormsg === ''){
          this.challenge = challengeData.data.data
          if(challengeData.data.data.userId != this.uid){
            this.couldUpvote = true
          }
        } else {
          this.showAlert(challengeData.data.errormsg)
        }
      }
      if(planList.data.errormsg === ''){
        if(planList.data.data.length){
          this.list = this.list.concat(planList.data.data)
        }
        if(planList.data.totalPager <= this.pageIndex * this.pageSize) {
          this.allLoaded = true //数据已全部获取完毕
          // this.$refs.loadmore.onBottomLoaded()
        }
      } else {
        this.showAlert(planList.data.errormsg)
      }
    },
    // 点赞事件
    async upvote() {
      if(!this.couldUpvote) return
      this.showLoading()
      let res = await http.post({
        type: '2',
        fkeyId: this.challenge.id
      },api.dealUpvote)
      this.hideLoading()
      this.loading = false;
      if(res.data.errormsg === ''){
        let rewardInfo = res.data.data.rewardInfo
        this.challenge.isUpvote = !this.challenge.isUpvote
        if(this.challenge.isUpvote){
          this.challenge.upvoteCount++
        } else {
          if(this.challenge.upvoteCount == '0') return
          this.challenge.upvoteCount--
        }
        if (rewardInfo && rewardInfo.reward && rewardInfo.reward > 0) {
          this.showToast(`积分+${rewardInfo.reward}`)
        }
      } else {
        this.showToast(res.data.errormsg)
      }
    },
    dateFormat(param){
      return dayjs(param).format('YYYY-MM-DD')
    },
    async joinApply(id,title){
      if(this.challenge.isApplyParticipative) return
      this.showLoading()
      let res = await http.post({
        type: 1, //1挑战 2方案
        fkeyId: id,
        title: title,
        userId: null,
        petName: null,
        name: null
      },api.insertApplyParticipative)
      this.hideLoading()
      if(res.data.errormsg === ''){
        this.showAlert('申请成功')
        this.challenge.isApplyParticipative = true
      } else {
        this.showAlert(res.data.errormsg)
      }
    },
    // 过滤html标签
    filterHtmlTag(text) {
      if (!text) return ''
      text = text.replace(/(\n)/g, "")
      text = text.replace(/(\t)/g, "")
      text = text.replace(/(\r)/g, "")
      return text.replace(/<\/?[^>]*>/g, "")
    }
  }
}
</script>

<style lang="less" scoped>
.challenge-detail {
  height: 100%;

  .challenge-item {
    margin-bottom: 0;
    margin-top: .2rem;
    &:first-child {
      margin: 0;
    }

    .spot {
      background-color: #4c566c;
    }

    .red {
      color: #ff3c00;
    }

    .btn {
      height: .55rem;
      margin: .08rem 0;
      padding: 0 .2rem;
      border-radius: .06rem;
      font-size: .24rem;
      color: #fff;
      background-color: #ff3c00;
      line-height: .55rem;

      &.disabled {
        color: #8c8c8c;
        background-color: #c9c9c9;
      }
    }
  }
  .screen-area .count {
    top: 0;
    left: .2rem;
    z-index: 1;
    font-size: .24rem;
    color: #252525;
    line-height: .72rem;
  }
  .challenge-entry.plan-entry {
    background-image: url("../assets/images/plan-entry.png");
  }
  .nodata {
    padding-top: .6rem;
  }
}
</style>
