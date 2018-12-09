<template>
  <div class="search-result" keep-alive>
    <header class="header-search">
      <div @click="back">
        <button class="mintui mintui-back"></button>
      </div>
      <input
        v-focus="focused"
        type="text"
        class="search-ipt"
        ref="searchIpt"
        v-model="searchVal"
        @keyup.enter="search">
      <button class="mintui btn" @click="search">搜索</button>
    </header>
    <mt-navbar v-model="selected" :fixed="true" class="horizontal">
      <mt-tab-item id="0" class="l">综合</mt-tab-item>
    </mt-navbar>
    <div class="content list-wrap">
      <no-data v-if="loading" iconType="3" text="努力加载中..."></no-data>
      <no-data v-if="!loading && !list.length" iconType="2" text="暂无数据~"></no-data>
      <mt-loadmore :top-method="loadTop" :bottom-method="loadBottom" :bottom-all-loaded="allLoaded" ref="loadmore" :autoFill="false">
        <ul>
          <li v-for="item in list" :key="item.id">
            <router-link tag="div" v-if="item.type === '9'" :to="{path: '/challengedetail', query: {id: item.id, planNum: item.answerCount ? item.answerCount : 0}}" class="challenge-item">
              <div class="item-title pr">
                {{item.title}}
                <span class="title-label pa">挑战</span>
              </div>
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
            </router-link>
            <router-link tag="div" v-if="item.type === '10'" :to="{path: '/plandetail', query: {id: item.id}}" class="challenge-item solution">
              <div class="item-title pr">
                {{item.title}}
                <span class="title-label pa">方案</span>
              </div>
              <p class="item-text ellipsis" v-html="filterHtmlTag(item.description)"></p>
              <div class="item-info fix">
                <span class="bold">{{item.criticizeCount || 0}}</span>
                <span>评论</span>
                <span class="spot"></span>
                <span class="bold">{{item.upvoteCount || 0}}</span>
                <span>赞同</span>
                <span class="spot"></span>
                <span class="date">{{dateFormat(item.createDate)}}</span>
              </div>
            </router-link>
            <router-link tag="div" v-if="item.type === '6'" :to="{path: `/project/detail?id=${item.id}`}" class="challenge-item project">
              <div class="item-title pr">
                {{item.title}}
                <span class="title-label pa">项目</span>
              </div>
              <div class="item-info fix">
                <span class="bold">{{item.upvoteCount || 0}}</span>
                <span>赞同</span>
                <span class="spot"></span>
                <span class="bold">{{item.criticizeCount || 0}}</span>
                <span>评论</span>
                <span class="spot"></span>
                <span class="date">{{dateFormat(item.createDate)}}</span>
                <span class="spot"></span>
                <span>项目进度</span>
                <span class="bold">{{handleProgress(item.id)}}%</span>
              </div>
            </router-link>
          </li>
        </ul>
      </mt-loadmore>
      <p class="nomore-data" v-if="allLoaded && list.length">暂无更多数据</p>
    </div>
  </div>
</template>

<script>
import NoData from './NoData'
import http from '../utils/http.js'
import api from '../utils/api.js'
import dayjs from 'dayjs'
import { mapState, mapMutations } from 'vuex'
import {focus} from 'vue-focus'

export default {
  components: {
    'no-data': NoData
  },
  computed: {
    ...mapState(['baseUrl','defaultHeadImg'])
  },
  directives: { focus: focus },
  // mounted () {
  //   this.$nextTick(() => {this.$refs.searchIpt.focus()})
  // },
  created () {
    if(this.$store.state.searchVal) {
      this.searchVal = this.$store.state.searchVal
      this.loadBottom()
    }
  },
  data(){
    return {
      searchVal: '',
      selected: '0',
      list: [],
      allLoaded: true,
      loading: false,
      pageIndex: 0,
      defaultImg: 'this.src="'+ require('../assets/images/default-img.png') +'"',
      projectProgressDetails: [],
      focused: true
    }
  },
  watch: {
    'searchVal' () {
      this.updateState({searchVal: this.searchVal})
    }
  },
  methods: {
    ...mapMutations(['updateState']),
    async loadBottom() {
      this.loading = true;
      let listData = await http.post({
        pageIndex: ++this.pageIndex,
        str: this.$store.state.searchVal
      },api.filterSearch)
      this.loading = false;
      if(listData.data.errormsg === ''){
        if(listData.data.data.h5GlobalSearchViewModel.length){
          this.list = this.list.concat(listData.data.data.h5GlobalSearchViewModel)
          this.projectProgressDetails = listData.data.data.projectProgressDetails
        }
        if(listData.data.totalPager <= this.pageIndex * this.pageSize) {
          this.allLoaded = true //数据已全部获取完毕
          this.$refs.loadmore.onBottomLoaded()
        }
      } else {
        this.showAlert(listData.data.errormsg)
      }
    },
    handleProgress (id) {
      let result = this.projectProgressDetails.filter(item => item.id === id)
      return result.length * 20
    },
    search () {
      this.pageIndex = 0
      this.list = []
      this.projectProgressDetails = []
      this.loadBottom()
    },
    loadTop() {
      this.pageIndex = 0
      this.list = []
      this.loadBottom()
      this.$refs.loadmore.onTopLoaded()
    },
    dateFormat(param){
      return dayjs(param).format('YYYY-MM-DD')
    },
    back() {
      this.updateState({searchVal: ''})
      this.$router.back()
    },
    // 过滤html标签
    filterHtmlTag(text) {
      if(!text) return
      text = text.replace(/(\n)/g, "")
      text = text.replace(/(\t)/g, "")
      text = text.replace(/(\r)/g, "")
      return text.replace(/<\/?[^>]*>/g, "")
    }
  }
}
</script>

<style lang="less" scoped>
.search-result {
  .header-search {
    .search-ipt {
      width: 5.4rem;
    }
    .btn {
      flex-shrink: 1;
      margin-right: .1rem;
      font-size: .3rem;
      color: #0291cd;
      text-align: center;
    }
  }
  .mint-navbar {
    margin-top: .92rem;
    border-bottom: 1px solid #edeef0;
    .mint-tab-item {
      flex: none;
      padding: 0 .36rem;
    }
  }
  .building {
    width: 2.71rem;
    margin: 0 auto;
    padding-top: 4.5rem;
    font-size: .4rem;
    color: #7d7d7e;
    line-height: .74rem;
    text-align: center;
    img {
      display: block;
      width: 100%;
    }
  }
}
.list-wrap {
  padding-top: 1.52rem;
  .challenge-item {
    .item-title {
      padding-top: .24rem;
      padding-bottom: 0;
      .title-label {
        top: .16rem;
      }
    }
    .item-text {
      padding-top: 0;
    }
    &:last-child {
      margin-bottom: .2rem;
    }
    &.solution .item-title {
      padding-bottom: .24rem;
    }
  }
}
.challenge-item.project {
  margin-bottom: .2rem;
  .item-title .title-label {
    background-color: #00b4ff;
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
}

</style>

<style>
body {
  background-color: #edeef0;
}
</style>
