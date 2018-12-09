<template>
  <mt-header :title="title" fixed>
    <mt-button slot="left" @click="back" v-if="leftBtnStyle==='text'">{{leftButton}}</mt-button>
    <mt-button slot="left" @click="back" icon="back" v-if="leftBtnStyle==='icon'"></mt-button>
    <mt-button slot="right" :class="{disabled: rightUnable}" @click="$emit('nextStep')">{{rightButton}}</mt-button>
  </mt-header>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: '标题'
    },
    rightButton: {
      type: String,
      default: '下一步'
    },
    leftButton: {
      type: String,
      default: '取消'
    },
    rightUnable: {
      type: Boolean,
      default: false
    },
    leftBtnStyle: {
      type: String,
      default: 'text'
    },
    customBack: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    back(){
      if (this.customBack) {
        this.$emit('back')
      } else {
        if(this.$route.query.toindex == 1){
          if(this.$route.query.platform == 1){
            // ios返回
            this.$bridge.callhandler('AppGoBackHandler', {}, (data) => {
            // 处理返回数据
            })
          } else {
            //安卓返回
            youliao.AppGoBackHandler()
          }
        } else {
          this.$router.back()
        }
      }
    }
  }
}
</script>

<style scoped lang="less">
.mint-header {
  border-bottom: 1px solid #eee;
}
.disabled {
  color: #bebebe;
}
</style>
