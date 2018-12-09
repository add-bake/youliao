<template>
  <div class="challenge">
    <header class="header-search">
      <div @click="back">
        <button class="mintui mintui-back"></button>
      </div>
      <input type="search" class="search-ipt" @click="search" readonly>
      <button class="mintui mintui-more" @click="popupMenuControl"></button>
      <div class="popup-menu pa" v-show="popupMenuShow" :class="{active: popupMenuAnimate}">
        <span class="arrow pa"></span>
        <router-link tag="div" to="/mychallenge">我的挑战</router-link>
        <router-link tag="div" to="/myplan">我的方案</router-link>
      </div>
    </header>
    <mt-navbar v-model="selected" :fixed="true" class="horizontal">
      <mt-tab-item id="0">全部项目</mt-tab-item>
      <mt-tab-item id="1">进行中</mt-tab-item>
      <mt-tab-item id="2">已完成</mt-tab-item>
    </mt-navbar>
    <screen-bar
      top="2.24rem"
      :departmentId="projectDepartment"
      :innovateId="projectChallenge"
      :technologyId="projectInnovation"
      :sortCheck="sortCheck"
      sortType="Project"
      @departmentChange="departmentChange"
      @innovateChange="innovateChange"
      @technologyChange="technologyChange"
      @sortChange="sortChange"
      @screenReset="screenReset"
      @screenSubmit="resetScroll"
      technologyShow
      ref="screenBar">
    </screen-bar>

    <div
      class="list-wrap"
      ref="wrapper">
      <no-data v-if="loading" iconType="3" text="努力加载中..."></no-data>
      <no-data v-if="!list.length && !loading" text="暂无数据~"></no-data>
      <mt-loadmore :top-method="loadTop" :bottom-method="loadBottom" :bottom-all-loaded="allLoaded" ref="loadmore" :autoFill="false">
        <ul>
          <li
            @click="toDetail(item.id)"
            v-for="item in list"
            :key="item.id"
            class="challenge-item">
            <div class="item-label">
              <span>{{item.projectDepartmentValue}}</span><span>{{item.projectChallengeValue}}</span><span class="last el">{{item.projectInnovationValue}}</span>
            </div>
            <div class="item-title pr">
              {{item.projectTitle}}
              <span class="title-label pa">项目</span>
            </div>
            <img class="item-img" :src="`${baseUrl}${item.projectCoverpicture}`" :onerror="defaultImg">
            <p class="item-text ellipsis">{{item.questionContent}}</p>
            <div class="item-info fix">
              <span class="bold">{{item.upvoteCount || 0}}</span>
              <span>赞同</span>
              <span class="spot"></span>
              <span class="bold">{{item.criticizeCount || 0}}</span>
              <span>评论</span>
              <span class="spot"></span>
              <span class="date">{{dateFormat(item.createDate)}}</span>
            </div>
            <div class="progress fix">
              <span class="progress-item l" v-for="index in progressTotal" :class="{cur: index <= item.progressId}"></span>
              <span class="progress-info l">进度：{{item.progressId * 20}}%</span>
            </div>
          </li>
        </ul>
      </mt-loadmore>
      <p class="nomore-data" v-if="allLoaded && list.length">暂无更多数据</p>
    </div>
  </div>
</template>

<script>
import ScreenBar from '../components/ScreenBar'
import NoData from '../components/NoData'
import http from '../utils/http.js'
import api from '../utils/api.js'
import dayjs from 'dayjs'
import { mapState , mapMutations } from 'vuex'

export default {
    name: "Project",
    components: {
      'screen-bar': ScreenBar,
      'no-data': NoData
    },
    beforeRouteEnter (to, from, next) {
      next(vm => {
        if (from.path === '/project/detail') {
          vm.$refs.wrapper.scrollTop = vm.$store.state.pageYOffset
        } else {
          vm.$refs.wrapper.scrollTop = 0
        }
      })
    },
    created() {
      this.loadBottom()
      this.updateState(this.$route.query)
    },
    computed: {
      ...mapState(['baseUrl','defaultHeadImg'])
    },
    watch: {
      'selected': function(param) {
        this.projectStatus = param
        this.updateState({projectSelected: this.selected})
        this.sortCheck = {
          text: '时间排序',
          value: '0'
        }
        if(this.$refs.screenBar.screenShow){
          this.$refs.screenBar.screenControl()
        }
        if(this.$refs.screenBar.sortShow){
          this.$refs.screenBar.sortControl()
        }
        this.screenReset()
      }
    },
    data() {
        return {
          selected: this.$store.state.projectSelected,
          list: [],
          loading: true,
          allLoaded: false,
          popupMenuShow: false,
          popupMenuAnimate: false,
          pageIndex: '0',
          pageSize: '10',
          projectStatus: this.$store.state.projectSelected, // 0: 查看全部 1：进行中 2:已完成
          projectDepartment: 'ALL',
          projectChallenge: 'ALL',
          projectInnovation: 'ALL',
          sortCheck: {
            text: '时间排序',
            value: '0'
          },
          orderBy: '0',
          defaultImg: 'this.src="'+ require('../assets/images/default-img.png') +'"',
          progressTotal: [ 1, 2, 3, 4, 5 ]
        }
    },
    methods: {
      ...mapMutations(['updateState']),
      loadTop() {
        this.screenReset()
        this.$refs.loadmore.onTopLoaded();
      },
      //获取列表数据
      async loadBottom() {
        this.loading = true
        this.pageIndex++
        let params = this.match(this.$data,['pageIndex', 'pageSize', 'projectDepartment', 'projectChallenge', 'projectInnovation', 'projectStatus', 'orderBy'])
        params['orderBy'] = params['orderBy'] || '0'
        let listData = await http.post(params,api.getProjectListAll)
        this.loading = false
        if(listData.data.errormsg === ''){
          this.list = this.list.concat(listData.data.data)
          if(this.pageIndex > 1 && !listData.data.data.length) {
            this.allLoaded = true //数据已全部获取完毕
            this.$refs.loadmore.onBottomLoaded()
          }
        } else {
          this.showAlert(listData.data.errormsg)
        }
      },
      toDetail (id) {
        this.updateState({pageYOffset: this.$refs.wrapper.scrollTop})
        this.$router.push({path: `/project/detail?id=${id}`})
      },
      back() {
        if(this.$route.query.platform == 1){
          // ios返回
          this.$bridge.callhandler('AppGoBackHandler', {}, (data) => {
          // 处理返回数据
          })
        } else {
          //安卓返回
          youliao.AppGoBackHandler()
        }
      },
      screenReset() {
        this.projectDepartment = 'ALL'
        this.projectChallenge = 'ALL'
        this.projectInnovation = 'ALL'
        this.resetScroll()
      },
      resetScroll() {
        this.pageIndex = 0
        this.list = []
        this.allLoaded = false
        this.loadBottom()
      },
      dateFormat(param){
        return param ? dayjs(param).format('YYYY-MM-DD') : '--:--:--'
      },
      departmentChange(val) {
        this.projectDepartment = val.id
      },
      innovateChange(val) {
        this.projectChallenge = val.id
      },
      technologyChange(val) {
        this.projectInnovation = val.id
      },
      sortChange(val) {
        this.sortCheck = val
        this.orderBy = val.value
        this.resetScroll()
      },
      // 弹出菜单显示隐藏
      popupMenuControl() {
        let self = this
        if(!this.popupMenuAnimate) {
          this.popupMenuShow = true
          setTimeout(() => self.popupMenuAnimate = !self.popupMenuAnimate,20)
        } else {
          this.popupMenuAnimate = !this.popupMenuAnimate
          setTimeout(() => self.popupMenuShow = false,400)
        }
      },
      search(){
        this.$router.push({path: '/searchresult'})
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
};
</script>

<style scoped lang="less">
.challenge {
  height: 100%;
  background-color: #edeef0;
}
.mint-navbar {
  margin-top: .92rem;
}

.list-wrap {
  padding-top: 2.24rem;
  padding-bottom: 1rem;
  .challenge-item .item-title .title-label {
    background-color: #00b4ff;
  }
}

.screen-bar {
  position: fixed;
  top: 1.52rem;
  z-index: 5;
}

.progress {
  padding: .12rem .2rem;
  border-top: .02rem solid #ebebeb;
  .progress-item {
    width: 1.04rem;
    height: .22rem;
    margin-right: .06rem;
    border-radius: .11rem;
    border: 1px solid #00b4ff;
    &.cur {
      background-color: #00b4ff;
    }
  }
  .progress-info {
    font-size: .24rem;
    color: #00b4ff;
    line-height: .24rem;
  }
}
</style>
