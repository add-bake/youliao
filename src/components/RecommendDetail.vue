<template>
  <div class="recommend">
    <my-header title="" rightButton="" leftBtnStyle="icon"></my-header>
    <div class="content">
      <no-data
        v-if="loading"
        iconType="3"
        text="努力加载中..."
      ></no-data>
      <no-data
        v-if="!detailData && !loading"
        text="暂无数据~"
      ></no-data>
      <img class="banner" :src="detailData.coverimage" alt="recommend_img" :onerror="defaultImg">
      <p class="item-title wrap">{{detailData.headlined}}</p>
      <p class="bottom-info wrap">{{detailData.createDate}}</p>
      <div class="item-text wrap" v-html="detailData.content"></div>
    </div>
  </div>
</template>

<script>
import http from '../utils/http.js'
import api from '../utils/api.js'
import NoData from './NoData'
import { mapMutations } from 'vuex'

export default {
  components: {
    'no-data': NoData
  },
  data () {
    return {
      loading: false,
      detailData: {},
      defaultImg: 'this.src="'+ require('../assets/images/default-img.png') +'"'
    }
  },
  created() {
    this.updateState(this.$route.query)
    this.getData()
  },
  methods: {
    ...mapMutations(['updateState']),
    async getData () {
      this.loading = true
      let {data} = await http.post({
        id: this.$route.query.id
      }, api.getRecommendById)
      this.loading = false
      if(data.errormsg === ''){
        this.detailData = data.data
      } else {
        this.showToast(data.errormsg)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.wrap {
  padding: 0 .2rem;
}
.title {
  font-size: .3rem;
  color: #000;
  line-height: .8rem;
  background-color: #e9e9e9;
}
.title-label {
  display: inline-block;
  padding: 0 .48rem 0 .36rem;
  margin: .27rem 0 .44rem 0;
  font-size: .36rem;
  line-height: .84rem;
  border-top-right-radius: .42rem;
  border-bottom-right-radius: .42rem;
  color: #fff;
  background-color: #ff0000;
}
.item-title {
  margin-top: .22rem;
  font-size: .36rem;
  color: #000;
  line-height: .58rem;
}
.item-text {
  margin-top: .54rem;
  font-size: .3rem;
  color: #000;
  line-height: .56rem;
}
.article-img {
  display: block;
  width: 7rem;
  margin: .24rem auto 0 auto;
}
.img-info {
  margin-bottom: .3rem;
  font-size: .24rem;
  color: #000;
  line-height: .44rem;
}
.bottom-info {
  font-size: .24rem;
  color: #000;
  line-height: .64rem;
  color: #8c8c8c;
}
.bottom-text {
  margin-bottom: .32rem;
  font-size: .24rem;
  color: #fff;
  line-height: .92rem;
  background-color: #ff0000;
}
</style>
