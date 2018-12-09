<template>
  <div class="my-challenge">
    <my-header title="我的挑战" rightButton="" leftBtnStyle="icon"></my-header>

    <div class="scroll-wrapper">
      <no-data v-if="loading" iconType="3" text="努力加载中..."></no-data>
      <no-data v-if="!list.length" iconType="2" text="暂无数据~"></no-data>
      <mt-loadmore :bottom-method="loadBottom" :bottom-all-loaded="allLoaded" ref="loadmore" :auto-fill="false">
        <ul>
          <router-link tag="li" :to="{path: '/challengedetail', query: {id: item.id, planNum: item.answerCount}}" v-for="item in list" :key="item.id" class="challenge-item">
            <div class="item-title pr">
              {{item.questionTitle}}
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
import { mapMutations } from 'vuex'

export default {
  components: {
    'no-data': NoData
  },
  created() {
    this.updateState(this.$route.query)
    this.loadBottom()
  },
  data() {
    return {
      list: [],
      allLoaded: false,
      loading: false,
      pageIndex: 0,
      pageSize: 10
    }
  },
  methods: {
    ...mapMutations(['updateState']),
    async loadBottom() {
      this.loading = true;
      let listData = await http.post({
        pageIndex: ++this.pageIndex,
        pageSize: this.pageSize
      },api.getMyVersusList)
      this.loading = false;
      if(listData.data.errormsg === ''){
        if(listData.data.data.length){
          this.list = this.list.concat(listData.data.data)
        }
        if(listData.data.totalPager <= this.pageIndex * this.pageSize) {
          this.allLoaded = true //数据已全部获取完毕
          this.$refs.loadmore.onBottomLoaded()
        }
      } else {
        this.showAlert(listData.data.errormsg)
      }
    },
    dateFormat(param){
      return dayjs(param).format('YYYY-MM-DD')
    },
  }
}
</script>

<style scoped lang="less">
.my-challenge {
  height: 100%;
  background-color: #edeef0;

  .scroll-wrapper {
    padding-top: 1.03rem;
    overflow: scroll;
    -webkit-overflow-scrolling:touch;

    .challenge-item {
      padding: .24rem 0 .05rem 0;
      border-bottom: 1px solid #edeef0;
      background-color: #fff;

      &:last-child {
        border: none;
      }

      .item-title {
        padding: 0 .24rem 0 .83rem;
        font-size: .36rem;
        color: #262626;
        font-weight: bold;
        line-height: .42rem;

        .title-label {
          top: -1px;
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

      .item-info {
        padding: 0 .2rem;
        font-size: .24rem;
        color: #8c8c8c;
        line-height: .72rem;

        span {
          float: left;
          &.bold {
            margin: 0 .06rem;
            font-weight: bold;
            color: #4c566c;
          }
          &.spot {
            width: .05rem;
            height: .05rem;
            margin: .34rem .2rem 0 .2rem;
            border-radius: 50%;
            background-color: #fdcd09;
          }
          &.date {
            color: #4c566c;
          }
        }
      }
    }
  }
}
</style>

