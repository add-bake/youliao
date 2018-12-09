<template>
  <div class="comment-list">
    <my-header title="评论" rightButton="" leftBtnStyle="icon"></my-header>
    <div class="ipt-box">
      <textarea class="text-adaption" type="text" :placeholder="replyInfo" v-model="commentValue" ref="commentIpt" :style="{height: commentIptHeight}"></textarea>
      <div class="btn-send" @click="send">发送</div>
    </div>
    <div class="content">
      <div class="total-info wrap">
        <span class="pr">评论</span>{{list.length}}
      </div>
      <no-data v-if="loading" iconType="3" text="努力加载中..."></no-data>
      <no-data v-if="!list.length && !loading" iconType="2" text="暂无数据~"></no-data>
      <ul>
        <li class="comment-item" v-for="item in list" :key="item.id">
          <div class="wrap btn-reply" v-if="item.replyFlag !== '2'" :class="{special: item.officialUser}" @click="setReplyParams(item.criticizeUserPetname ? item.criticizeUserPetname : '创新访客', item.criticizeUserId, item.id)">
            <div class="item-info fix">
              <img class="head l" :src="`${baseUrl}${item.criticizeUserPhoto}`" :onerror="defaultHeadImg">
              <div class="l">
                <p class="name el">{{item.criticizeUserPetname ? item.criticizeUserPetname : '创新访客'}}</p>
                <p class="date el">{{dateFormat(item.updateDate)}}</p>
              </div>
            </div>
            <div class="item-content" v-html="item.content"></div>
          </div>
          <div v-if="item.replyFlag === '2'" :class="{special: item.officiaUserReply}">
            <div class="wrap btn-reply" @click="setReplyParams(item.replyUserPetname ? item.replyUserPetname : '创新访客', item.replyUserId, item.id)">
              <div class="item-info fix">
                <img class="head l" :src="`${baseUrl}${item.replyUserPhoto}`" :onerror="defaultHeadImg">
                <div class="l">
                  <p class="name el">{{item.replyUserPetname ? item.replyUserPetname : '创新访客'}}</p>
                  <p class="date el">{{dateFormat(item.updateDate)}}</p>
                </div>
              </div>
              <div class="item-content" v-html="item.content"></div>
            </div>
            <div class="wrap">
              <div class="reply-from pr">
                <p class="info">回复：<span>{{item.criticizeUserPetname ? item.criticizeUserPetname : '创新访客'}}</span></p>
                <ellipsis :introduce="item.replyCriticizeViewModelContent"></ellipsis>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import NoData from '../components/NoData'
import Ellipsis from '../components/Ellipsis'
import http from '../utils/http.js'
import api from '../utils/api.js'
import dayjs from 'dayjs'
import {mapState, mapMutations} from 'vuex'

export default {
  components: {
    'no-data': NoData,
    'ellipsis': Ellipsis
  },
  computed: {
    ...mapState(['baseUrl','defaultHeadImg','uid'])
  },
  mounted() {
    this.autoTextarea()
  },
  created() {
    this.updateState(this.$route.query)
    this.loadBottom()
  },
  data() {
    return {
      loading: false,
      list: [],
      commentValue: '',
      replyParams: {},
      replyInfo: '输入评论',
      commentIptHeight: '.7rem'
    }
  },
  methods: {
    ...mapMutations(['updateState']),
    async loadBottom() {
      this.loading = true;
      let listData = await http.post({
        type: 10,
        fkeyId: this.$route.query.id
      },api.getReplyAndCriticizeLists)
      this.loading = false;
      if(listData.data.errormsg === ''){
        if(listData.data.data.length){
          this.list = this.list.concat(listData.data.data)
        }
      } else {
        this.showAlert(listData.data.errormsg)
      }
    },
    async send () {
      if (!this.trim(this.commentValue)) return this.showToast('请输入评论内容')
      this.showLoading()
      let params = {
        fkeyId: this.$route.query.id,
        type: 10,
        content: this.commentValue,
        isAnonymons: 1,
        replyFlag: 1
      }
      if (this.replyParams['replyFlag'] == 2) params = Object.assign(params, this.replyParams)
      let res = await http.post(params,api.criticizeInsert)
      this.hideLoading()
      if(res.data.errormsg === ''){
        let rewardInfo = res.data.data.rewardInfo
        this.showToast(`评论提交成功${rewardInfo && rewardInfo.reward && rewardInfo.reward > 0 ? '，积分+' + rewardInfo.reward : ''}`)
        this.commentValue = ''
        this.list = []
        this.replyParams = {}
        this.replyInfo = '输入评论'
        this.commentIptHeight = '.7rem'
        this.loadBottom()
      } else {
        this.showAlert(res.data.errormsg)
      }
    },
    setReplyParams (name, criticizeUserId, lastCriticizeId) {
      if (criticizeUserId === this.uid) return this.showToast('不可以回复自己的评论')
      this.replyParams = {
        replyFlag: 2,
        criticizeUserId: criticizeUserId,
        lastCriticizeId: lastCriticizeId,
        replyUserId: this.uid
      }
      this.replyInfo = `@${name}：`
      this.$refs.commentIpt.focus()
    },
    autoTextarea() {
      let obj = document.getElementsByClassName('text-adaption')
      let len=obj.length
      let that = this

      for(let i=0;i<len;i++){
        obj[i].onkeyup = function() {
          that.commentIptHeight = this.scrollHeight + 'px'
        }
      }
    },
    dateFormat(param){
      return dayjs(param).format('YYYY-MM-DD')
    }
  }
}
</script>

<style lang="less" scoped>
.comment-list {
  height: 100%;
  .ipt-box {
    display: flex;
    align-items: center;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 12;
    padding: .14rem 0 .14rem .25rem;
    background-color: #fff;
    textarea {
      flex: 1;
      box-sizing: border-box;
      width: 100%;
      height: .7rem;
      padding: .13rem .3rem;
      border: none;
      border-radius: .06rem;
      font-size: .3rem;
      background-color: #f3f4f8;
      outline: none;
      resize: none;
    }
    .btn-send {
      flex: none;
      width: 1.4rem;
      font-size: .3rem;
      color: #0291cd;
      text-align: center;
    }
  }
  .content {
    box-sizing: border-box;
    height: 100%;
    padding-bottom: .98rem;
    overflow: scroll;
    -webkit-overflow-scrolling:touch;
    .wrap {
      padding-left: .34rem;
      padding-right: .34rem;
    }
    .total-info {
      font-size: .36rem;
      color: #252525;
      line-height: .8rem;
      span {
        padding-right: .26rem;
        &::after {
          content: '';
          position: absolute;
          right: .12rem;
          top: 50%;
          z-index: 1;
          width: .03rem;
          height: .14rem;
          margin-top: -.07rem;
          background-color: #408fc8;
        }
      }
    }
    .comment-item {
      border-bottom: 1px solid #e8e8e8;
      .head {
        box-sizing: border-box;
        width: .76rem;
        height: .76rem;
        margin-right: .2rem;
        border-radius: 50%;
      }
      .name {
        max-width: 5.6rem;
        margin-top: .02rem;
        font-size: .3rem;
        line-height: .4rem;
        color: #252525;
      }
      .date {
        max-width: 5.6rem;
        font-size: .22rem;
        color: #757575;
        line-height: .34rem;
      }
      .item-content {
        margin-top: .2rem;
        font-size: .28rem;
        color: #252525;
        line-height: .42rem;
      }
      .reply-from {
        padding: .26rem .24rem;
        margin-top: .33rem;
        margin-bottom: .2rem;
        font-size: .26rem;
        color: #242424;
        line-height: .42rem;
        background-color: #f6f6f6;
        &::before {
          content: '';
          position: absolute;
          top: -.2rem;
          left: .32rem;
          z-index: 1;
          width: 0;
          height: 0;
          border-bottom: .2rem solid #f6f6f6;
          border-left: .12rem solid transparent;
          border-right: .12rem solid transparent;
        }
        span {
          font-weight: bold;
        }
      }
      .special {
        .head {
          border: .03rem solid #f5cf47;
          &::after {
            content: '';
            position: absolute;
            top: .02rem;
            right: -.07rem;
            z-index: 1;
            width: .35rem;
            height: .35rem;
            border-radius: 50%;
            background: #f5cf47 url("../assets/images/v.png") center center no-repeat;
            background-size: .21rem .18rem;
          }
        }
        .name {
          color: #f5cf47;
        }
      }
      .btn-reply {
        padding: .28rem .34rem .12rem .34rem;
        &:active {
          background-color: #fee1e1;
        }
      }
    }
  }
}
</style>
<style lang="less">
.detailed-introduce .intro-content {
  max-height: 1.92rem!important;
  background: #f6f6f6!important;
  color: #f6f6f6!important;
  &::before {
    padding: 0!important;
    background: #f6f6f6!important;
  }
  &::after {
    padding: 0!important;
    padding-right: 2.1rem!important;
  }
  .introduce-text {
    margin: 0;
  }
}
.total-introduce .intro-content .introduce-text {
  margin: 0!important;
}
</style>
