<template>
  <div class="association" v-if="associationList.length">
    <transition-group appear tag="ul">
      <router-link
        tag="li"
        :to="{path: '/challengedetail', query: {id: item.id, planNum: item.answerCount ? item.answerCount : 0}}"
        class="association-item"
        v-for="item in associationList"
        :key="item.id">
        <p class="item-tit el2">{{item.questionTitle}}</p>
        <p class="item-info">
          <span>{{item.viewCount}}浏览</span>
          <span>{{item.upvoteCount}}赞同</span>
        </p>
      </router-link>
    </transition-group>
  </div>
</template>

<script>
import _ from 'lodash'
import http from '../utils/http.js'
import api from '../utils/api.js'

export default {
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      associationList: []
    }
  },
  mounted () {
    if (this.title) this.getChallengeByTitle(this.title)
  },
  watch: {
    title (val) {
      if (val) {
        this.getChallengeByTitle(val)
      } else {
        this.associationList = []
      }
    }
  },
  methods: {
    getChallengeByTitle: _.throttle(async function(name){
      let {data} = await http.post({
        questionTitle: name
      }, api.getChallengeByTitle)
      if(!data.errormsg) this.associationList = data.data
    }, 1000)
  }
}
</script>

<style lang="less" scoped>
.association {
  position: fixed;
  top: 2.8rem;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  padding: 0 .34rem;
  background-color: #fff;
  overflow: scroll;
  -webkit-overflow-scrolling: touch;
  .association-item {
    box-sizing: border-box;
    border-top: 1px solid #e5e5e5;
    padding: .26rem .08rem .16rem .08rem;
    background-color: #fff;
    .item-tit {
      font-size: .32rem;
      color: #262626;
      font-weight: bold;
      line-height: .48rem;
    }
    .item-info {
      font-size: .28rem;
      color: #8c8c8c;
      line-height: .5rem;
      span {
        margin-right: .24rem;
      }
    }
  }
}
</style>
