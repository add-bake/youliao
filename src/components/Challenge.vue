<template>
  <div class="challenge">
    <header class="header-search">
      <div @click="back">
        <button class="mintui mintui-back"></button>
      </div>
      <div class="search-ipt" @click="search"></div>
      <button class="mintui mintui-more" @click="popupMenuControl"></button>
      <div class="popup-menu pa" v-show="popupMenuShow" :class="{active: popupMenuAnimate}">
        <span class="arrow pa"></span>
        <router-link tag="div" to="/mychallenge">我的挑战</router-link>
        <router-link tag="div" to="/myplan">我的方案</router-link>
      </div>
    </header>
    <mt-navbar v-model="selected" :fixed="true" class="horizontal">
      <mt-tab-item id="0">全部挑战</mt-tab-item>
      <mt-tab-item id="1">创委挑战</mt-tab-item>
      <mt-tab-item id="2">民间挑战</mt-tab-item>
      <mt-tab-item id="3">解决方案</mt-tab-item>
    </mt-navbar>
    <screen-bar
      top="2.24rem"
      :departmentId="departmentId"
      :innovateId="innovateId"
      :technologyId="technologyId"
      :sortType="sortType"
      :sortCheck="sortCheck"
      @departmentChange="departmentChange"
      @innovateChange="innovateChange"
      @technologyChange="technologyChange"
      @sortChange="sortChange"
      @screenReset="screenReset"
      @screenSubmit="resetScroll"
      ref="screenBar">
    </screen-bar>

    <div
      class="list-wrap"
      ref="wrapper">
      <no-data v-if="loading" iconType="3" text="努力加载中..."></no-data>
      <no-data v-if="!list.length && !loading" text="暂无数据~"></no-data>
      <mt-loadmore :top-method="loadTop" :bottom-method="loadBottom" :bottom-all-loaded="allLoaded" ref="loadmore" :autoFill="false">
        <ul v-if="officialFolk !== '3'">
          <li
            @click="toDetail(item.id, 'challenge')"
            v-for="item in list"
            :key="item.id"
            class="challenge-item">
            <div class="item-label fix">
              <span>{{item.departmentText}}</span><span>{{item.innovateText}}</span>
            </div>
            <div class="item-title pr">
              {{item.questionTitle}}
              <span class="title-label pa">挑战</span>
            </div>
            <img class="item-img" :src="`${baseUrl}${item.coverImgUrl}`" :onerror="defaultImg">
            <!-- <p class="item-text ellipsis">{{item.questionContent}}</p> -->
            <div class="item-info fix">
              <span class="bold">{{item.officialFolk === '1' ? '创委' : '民间'}}挑战</span>
              <span class="spot"></span>
              <span class="bold">{{item.answerCount || 0}}</span>
              <span>方案</span>
              <span class="spot"></span>
              <span class="bold">{{item.upvoteCount || 0}}</span>
              <span>赞同</span>
              <span class="spot"></span>
              <span class="date">{{dateFormat(item.vsEndDate)}} 结束</span>
            </div>
          </li>
        </ul>
        <ul v-if="officialFolk === '3'">
          <li
            @click="toDetail(item.id, 'plan')"
            v-for="item in list"
            :key="item.id"
            class="challenge-item solution">
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
    </div>

    <router-link to="/createChallenge" class="challenge-entry" v-show="btnShow">挑战</router-link>
  </div>
</template>

<script>
import ScreenBar from './ScreenBar'
import NoData from './NoData'
import http from '../utils/http.js'
import api from '../utils/api.js'
import dayjs from 'dayjs'
import { mapState , mapMutations } from 'vuex'

export default {
    name: "Challenge",
    components: {
      'screen-bar': ScreenBar,
      'no-data': NoData
    },
    beforeRouteEnter (to, from, next) {
      next(vm => {
        if (from.path === '/challengedetail' || from.path === '/plandetail') {
          vm.$refs.wrapper.scrollTop = vm.$store.state.pageYOffset
        } else {
          vm.$refs.wrapper.scrollTop = 0
        }
      })
    },
    created() {
      this.updateState(this.$route.query)
      this.loadBottom()
      this.callback = () => { this.loadTop() }
      this.$bus.$on('challengeUpdate', this.callback)
    },
    destroyed () {
      this.$bus.$off('challengeUpdate', this.callback)
    },
    computed: {
      ...mapState(['baseUrl','defaultHeadImg'])
    },
    watch: {
      'selected': function(param) {
        switch(param){
          case '0':
            this.officialFolk = ''
            break
          case '1':
            this.officialFolk = '1'
            break
          case '2':
            this.officialFolk = '2'
            break
          case '3':
            this.officialFolk = '3'
            break
          default:
            this.officialFolk = ''
        }

        this.sortType = this.officialFolk === '3' ? 'Plan' : 'Challenge'
        this.btnShow = this.officialFolk === '3' ? false : true
        this.updateState({challengeSelected: this.selected})
        this.sortCheck = {
          text: '时间排序',
          value: '5'
        }
        if(this.$refs.screenBar.screenShow){
          this.$refs.screenBar.screenControl()
        }
        if(this.$refs.screenBar.sortShow){
          this.$refs.screenBar.sortControl()
        }
        this.$refs.screenBar.selected = '1'
        this.screenReset()
      }
    },
    data() {
        return {
          selected: this.$store.state.challengeSelected,
          list: [],
          loading: true,
          allLoaded: false,
          popupMenuShow: false,
          popupMenuAnimate: false,
          pageIndex: '0',
          pageSize: '10',
          officialFolk: this.$store.state.challengeSelected === '0' ? '' : this.$store.state.challengeSelected, // 1：创委 2：民间 3:获取全部方案列表
          departmentId: 'ALL',
          innovateId: 'ALL',
          technologyId: 'ALL',
          sortCheck: {
            text: '时间排序',
            value: '5'
          },
          sortMethod: '5',
          defaultImg: 'this.src="'+ require('../assets/images/default-img.png') +'"',
          sortType: 'Challenge',
          btnShow: true //挑战按钮显示隐藏
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
        let params = this.match(this.$data,['pageIndex', 'pageSize', 'departmentId', 'innovateId', 'technologyId', 'officialFolk', 'sortMethod'])
        let listData = await http.post(params,this.officialFolk ==='3' ? api.getAllPlanlist : api.getAllOrNeedVersus)
        this.loading = false
        if(listData.data.errormsg === ''){
          this.list = this.list.concat(listData.data.data)
          if(listData.data.totalPager <= this.pageIndex * this.pageSize) {
            this.allLoaded = true //数据已全部获取完毕
            this.$refs.loadmore.onBottomLoaded()
          }
        } else {
          this.allLoaded = true
          this.$refs.loadmore.onBottomLoaded()
          this.showAlert(listData.data.errormsg)
        }
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
      toDetail (id, type) {
        this.updateState({pageYOffset: this.$refs.wrapper.scrollTop})
        this.$router.push({path: type === 'challenge' ? '/challengedetail' : 'plandetail', query: {id: id}})
      },
      screenReset() {
        this.departmentId = 'ALL'
        this.innovateId = 'ALL'
        this.technologyId = 'ALL'
        this.resetScroll()
      },
      resetScroll() {
        this.pageIndex = 0
        this.list = []
        this.allLoaded = false
        this.loadBottom()
      },
      dateFormat(param){
        return dayjs(param).format('YYYY-MM-DD')
      },
      departmentChange(val) {
        this.departmentId = val.id
      },
      innovateChange(val) {
        this.innovateId = val.id
      },
      technologyChange(val) {
        this.technologyId = val.id
      },
      sortChange(val) {
        this.sortCheck = val
        this.sortMethod = val.value
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
}

.screen-bar {
  position: fixed;
  top: 1.52rem;
  z-index: 5;
}
</style>
