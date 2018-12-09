<template>
  <div :class="showTotal ? 'total-introduce' : 'detailed-introduce'">
    <div class="intro-content" :title="introduce" ref="desc">
      <div class="merchant-desc" v-if="introduce">
        <p class="introduce-text" v-html="introduce.replace(/(\n)/g,'<br>')"></p>
        <img class="img" v-for="item in imgList" :key="item.id" :src="`${baseUrl}${item.imgUrl}`" :onerror="defaultImg">
      </div>
      <div class="unfold" @click="showTotalIntro" v-if="showExchangeButton">
        <p>{{exchangeButton ? '展开全部' : '收起'}}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    introduce: {
      type: String,
      default: ''
    },
    imgList: {
      type: Array,
      default() {
        return []
      }
    }
  },
  computed: {
    ...mapState(['baseUrl'])
  },
  data() {
    return {
      // 是否展示所有文本内容
      showTotal: false,
      // 显示展开还是收起
      exchangeButton: true,
      // 是否显示展开收起按钮
      showExchangeButton: true,
      defaultImg: 'this.src="'+ require('../assets/images/img-error.jpg') +'"',
    }
  },
  mounted () {
    this.checkStatus()
  },
  watch: {
    'introduce'() {
      this.checkStatus()
    }
  },
  methods: {
    showTotalIntro () {
      this.showTotal = !this.showTotal;
      this.exchangeButton = !this.exchangeButton;
    },
    getRem () {
      const defaultRem = 16;
      let winWidth = window.innerWidth;
      let rem = winWidth / 375 * defaultRem;
      return rem;
    },
    checkStatus () {
      this.$nextTick(function () {
        // 判断介绍是否超过四行
        let rem = parseFloat(this.getRem())
        if (!this.$refs.desc) {
          return;
        }
        let descHeight = window.getComputedStyle(this.$refs.desc).height.replace('px', '')
        if (descHeight > 5.25 * rem) {
          // 显示展开收起按钮
          this.showExchangeButton = true
          this.exchangeButton = true
          // 不是显示所有
          this.showTotal = false
        } else {
          // 不显示展开收起按钮
          this.showExchangeButton = false
          // 没有超过四行就显示所有
          this.showTotal = true
        }
      }.bind(this))
    }
  }
}
</script>

<style lang="less" scoped>
.img {
  margin: .2rem 0;
}
.total-introduce {
  height: auto;
  overflow: hidden;
  font-size: .3rem;
  color: #4c566c;
  
  .intro-content {
    .merchant-desc {
      width: 100%;
      line-height: .48rem;
    }
    .introduce-text {
      margin: .2rem .3rem;
    }
  }
  .unfold {
    display: block;
    z-index: 11;
    float: right;
    width: .8rem;
    height: .48rem;
    p {
      margin: 0;
      line-height: .48rem;
      color: #4c566c;
      font-weight: bold;
    }
  }
}
.detailed-introduce {
  font-size: .3rem;
  color: #434343;
  position: relative;
  overflow: hidden;
  
  .intro-content {
    // 最大高度设为4倍的行间距
    max-height: 2.12rem;
    line-height: .48rem;
    word-wrap: break-word;
    /*强制打散字符*/
    word-break: break-all;
    background: #fff;
    /*同背景色*/
    color: #fff;
    overflow: hidden;
    .merchant-desc {
      width: 100%;
      line-height: .48rem;
    }
    &:after,
    // 这是展开前实际显示的内容
    &:before {
      content: attr(title);
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      padding: .2rem .2rem 0 .2rem;
      color: #4c566c
      // overflow: hidden;
    }
    // 把最后最后一行自身的上面三行遮住
    &:before {
      display: block;
      overflow: hidden;
      z-index: 1;
      max-height: 1.44rem;
      background: #ffffff;
    }
    &:after {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      overflow: hidden;
      height: 2.12rem;
      /*截取行数*/
      -webkit-line-clamp: 4;
      text-overflow: ellipsis;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      /*行首缩进字符数，值为[(截取行数-1)*尾部留空字符数]*/
      text-indent: -12em;
      /*尾部留空字符数*/
      padding-right: 2.1rem;
    }
    .introduce-text {
      margin: .2rem .3rem;
    }
    .unfold {
      z-index: 11;
      width: 2.04rem;
      height: .48rem;
      outline: 0;
      position: absolute;
      right: 0;
      bottom: 0;
      p {
        margin: 0;
        line-height: .48rem;
        color: #4c566c;
        font-weight: bold;
      }
    }
  }
}
</style>
