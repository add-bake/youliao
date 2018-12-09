<template>
  <div class="index-list">
    <no-data
      v-if="loading"
      iconType="3"
      text="努力加载中..."
    ></no-data>
    <no-data
      v-if="!list.length && !loading"
      text="暂无数据~"
    ></no-data>
    <mt-loadmore
      :top-method="loadTop"
      ref="loadmore"
      :autoFill="false"
      class="list-wrap"
      v-if="list.length && !loading">
      <div v-for="item in list" :key="item.id">
        <div v-if="item.recommendFlag === 1" class="challenge-item" @click="toRecommendDetail(item)">
          <div class="item-title pr el2">
            {{item.headlined}}
            <span class="title-label pa">推荐</span>
          </div>
          <img class="item-img" :src="`${baseUrl}${item.coverimage}`" :onerror="defaultImg">
          <div class="item-info fix">
            <span class="date">发布时间：{{dateFormat(item.createDate)}}</span>
          </div>
        </div>
        <div
          v-if="item.recommendFlag === 2 && item.connectType === '2'"
          @click="toAnswerDetail(item.connectId)"
          class="challenge-item question">
          <div class="item-title pr el2">
            {{item.headlined}}
            <span class="title-label pa">Q</span>
          </div>
          <div class="item-text ellipsis" v-html="filterHtmlTag(item.content)"></div>
          <div
            class="plan-img pr oh"
            v-if="item.firstContentImgUrl">
            <img
              :src="`${baseUrl}${item.firstContentImgUrl}`"
              alt="answer" />
          </div>
          <div class="item-info fix">
            <span class="item-type">回答</span>
            <span class="bold">{{item.viewCount}}</span>
            <span>浏览</span>
            <span class="spot"></span>
            <span class="bold">{{item.upvoteCount}}</span>
            <span>赞同</span>
            <span class="spot"></span>
            <span class="bold">{{item.criticizeCount}}</span>
            <span>评论</span>
          </div>
        </div>
        <div v-if="item.recommendFlag === 2 && item.connectType === '4'" class="challenge-item solution" @click="toLinkDetail(`/plandetail?id=${item.connectId}`)">
          <div class="author-info fix el">
            <img :src="`${baseUrl}${item.userPhoto}`" :onerror="defaultHeadImg" class="l">
            {{item.userPetName}}
          </div>
          <div class="item-title pr el2" >
            {{filterHtmlTag(item.headlined)}}
            <span class="title-label pa">方案</span>
          </div>
          <str-img
            :str="item.content"
            single>
          </str-img>
          <p
            class="item-text ellipsis"
            v-html="filterHtmlTag(item.content)">
          </p>
          <div class="item-info fix">
            <span class="bold">{{item.criticizeCount || 0}}</span>
            <span>评论</span>
            <span class="spot"></span>
            <span class="bold">{{item.upvoteCount || 0}}</span>
            <span>赞同</span>
            <span class="spot"></span>
            <span class="date">{{dateFormat(item.createDate)}}</span>
          </div>
        </div>
      </div>
    </mt-loadmore>
  </div>
</template>

<script>
import http from '../utils/http.js'
import api from '../utils/api.js'
import dayjs from 'dayjs'
import { mapState, mapMutations } from 'vuex'
import NoData from './NoData'
import StrToImgList from './StrToImgList'

export default {
  components: {
    'no-data': NoData,
    'str-img': StrToImgList
  },
  computed: {
    ...mapState(['defaultHeadImg', 'baseUrl', 'sid'])
  },
  created () {
    this.updateState(this.$route.query)
    this.getData()
  },
  data() {
    return {
      loading: false,
      list: [],
      defaultImg: 'this.src="'+ require('../assets/images/default-img.png') +'"'
    }
  },
  methods: {
    ...mapMutations(['updateState']),
    loadTop() {
      this.list = []
      this.getData()
      this.$refs.loadmore.onTopLoaded()
    },
    async getData () {
      this.loading = true
      let {data} = await http.get(api.getRecommendList, {
        __sid: this.sid
      })
      this.loading = false
      if(data.errormsg === ''){
        this.list = data.data
      } else {
        this.showToast(data.errormsg)
      }
    },
    toRecommendDetail (item) {
      // type 1-表示图文 2-表示跳转
      if (item.type === '1') {
        this.toLinkDetail(`/index/detail?id=${item.id}`)
      } else if (item.type === '2') {
        // connectType 0-表示没有跳转 1-提问，2-回答，3-挑战，4-方案，5-项目
        if (item.connectType === '1') {
          this.toQuestionDetail(item.connectId)
        } else if (item.connectType === '2') {
          this.toAnswerDetail(item.connectId)
        } else if (item.connectType === '3') {
          this.toLinkDetail(`/challengedetail?id=${item.connectId}`)
        } else if (item.connectType === '4') {
          this.toLinkDetail(`/plandetail?id=${item.connectId}`)
        } else if (item.connectType === '5') {
          this.toLinkDetail(`/project/detail?id=${item.connectId}`)
        }
      }
      
    },
    toAnswerDetail (id) {
      if(this.$route.query.platform == 1){
        // ios交互
        this.$bridge.callhandler('AppAnswerDetailHandler', {'AnswerID': `${id}`}, (data) => {
          // 处理返回数据
        })
      } else {
        //安卓交互
        youliao.AppAnswerDetailHandler(JSON.stringify({'AnswerID': `${id}`}))
      }
    },
    toQuestionDetail (id) {
      if(this.$route.query.platform == 1){
        // ios交互
        this.$bridge.callhandler('AppQuestionDetailHandler', {'QuestionID': `${id}`}, (data) => {
          // 处理返回数据
        })
      } else {
        //安卓交互
        youliao.AppQuestionDetailHandler(JSON.stringify({'QuestionID': `${id}`}))
      }
    },
    toLinkDetail(link) {
      if(this.$route.query.platform == 1){
        // ios交互
        this.$bridge.callhandler('AppHomeWebItemHandler', {'param': link}, (data) => {
          // 处理返回数据
        })
      } else {
        //安卓交互
        youliao.AppHomeWebItemHandler(JSON.stringify({'param': link}))
      }
    },
    dateFormat(param){
      return dayjs(param).format('YYYY-MM-DD')
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
.index-list {
  height: 100%;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}
.list-wrap .challenge-item {
  padding-top: .24rem;
  &:last-child {
    margin-bottom: .2rem;
  }
  .item-title .title-label {
    background-color: #000;
    color: #fdcd09;
  }
  &.solution {
    .item-title .title-label {
      background-color: #95dc48;
      color: #fff;
    }
  }
  &.question {
    .item-title {
      padding-left: .48rem;
      .title-label {
        padding-right: .13rem;
        color: #fff;
        background-color: #0291cd;
      }
    }
    .item-text {
      padding-top: 0;
    }
    .item-type {
      margin: .2rem .2rem .2rem 0;
      padding: 0 .15rem;
      border-radius: .08rem;
      font-size: .2rem;
      line-height: .32rem;
      color: #fff;
      background-color: #fdcd09;
    }
    .item-info {
      span.spot {
        width: .03rem;
        height: .12rem;
        margin: .3rem .12rem;
        background-color: #0291cd;
      }
    }
  }
}
.plan-img {
  width: 100%;
  height: 3.74rem;
  img {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 1;
    max-width: none;
    width: 100%;
    height: auto;
    transform: translate3d(-50%,-50%,0);
  }
}
</style>
