<template>
    <div class="main-box">
      <router-view></router-view>
      <mt-tabbar v-model="selected" class="footer">
        <mt-tab-item id="index">
          <img slot="icon" :src="indexIcon">
          首页
        </mt-tab-item>
        <mt-tab-item id="challenge">
          <img slot="icon" :src="challengeIcon">
          挑战
        </mt-tab-item>
        <mt-tab-item id="project">
          <img slot="icon" :src="projectIcon">
          项目
        </mt-tab-item>
      </mt-tabbar>
    </div>
</template>

<script>
import { mapState , mapMutations } from 'vuex'

export default {
  data() {
    return {
      selected: this.mainSelected,
      indexIcon: require('../assets/images/icon-home.png'),
      challengeIcon: require('../assets/images/icon-challenge-check.png'),
      projectIcon: require('../assets/images/icon-project.png')
    }
  },
  created () {
    this.challengeIcon = require(`../assets/images/icon-challenge${this.mainSelected === 'challenge' ? '-check' : ''}.png`)
    this.projectIcon = require(`../assets/images/icon-project${this.mainSelected === 'project' ? '-check' : ''}.png`)
  },
  computed: {
      ...mapState(['mainSelected'])
    },
  watch: {
    selected: function(val) {
      this.updateState({mainSelected: val})
      if(val === 'challenge') {
        this.challengeIcon = require('../assets/images/icon-challenge-check.png')
        this.projectIcon = require('../assets/images/icon-project.png')
        this.$router.replace({path: '/challenge',query: this.$route.query})
      } else if(val === 'project') {
        this.challengeIcon = require('../assets/images/icon-challenge.png')
        this.projectIcon = require('../assets/images/icon-project-check.png')
        this.$router.replace({path: '/project',query: this.$route.query})
      } else if(val === 'index') {
        if(this.$route.query.platform == 1){
          // ios返回
          this.$bridge.callhandler('AppGoBackHandler', {}, (data) => {
          // 处理返回数据
          })
        } else {
          // 安卓返回
          youliao.AppGoBackHandler()
        }
      }
    }
  },
  methods: {
    ...mapMutations(['updateState'])
  }
}
</script>

<style lang="less" scoped>
.main-box {
  height: 100%;

  .mint-tabbar > .mint-tab-item.is-selected {
    background-color: #fff;
    color: #2c2c2c;
  }
}

</style>

