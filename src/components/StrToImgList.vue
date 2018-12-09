<template>
  <div class="img-list">
    <template v-if="!single">
      <div
        class="img-item"
        v-for="(item, index) in imgList"
        :key="index"
        :class="{three: imgList.length === 3}">
        <div class="img-box oh pr">
          <img :src="item" :onerror="defaultImg">
        </div>
      </div>
    </template>
    <template v-else>
      <div class="single-img pr oh">
        <img
        v-if="imgList[0]"
        :src="imgList[0]"
        :onerror="defaultImg">
      </div>
    </template>
  </div>
</template>

<script>
export default {
  props: {
    str: String,
    single: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      imgList: [],
      defaultImg: 'this.src="'+ require('../assets/images/default-img.png') +'"',
    }
  },
  mounted () {
    this.handleStr()
  },
  methods: {
    handleStr () {
      let imgReg = /<img.*?(?:>|\/>)/gi
      let srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i
      let arr = this.str.match(imgReg)
      if(arr) {
        for (let i = 0; i < arr.length; i++) {
          let src = arr[i].match(srcReg)
          this.imgList.push(src[1])
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
.img-list {
  display: flex;
  padding: 0 .1rem;
  .img-item {
    position: relative;
    flex-shrink: 0;
    width: 50%;
    height: 2.22rem;
    padding: .1rem;
    box-sizing: border-box;
    &.three {
      width: 33.33333333%;
      img {
        width: auto;
        height: 100%;
      }
    }
    .img-box {
      width: 100%;
      height: 100%;
    }
    img {
      position: absolute;
      left: 50%;
      top: 50%;
      z-index: 1;
      max-width: none;
      width: 100%;
      transform: translate3d(-50%,-50%,0);
    }
  }
  .single-img {
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
}
</style>

