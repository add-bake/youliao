<template>
  <div class="my-challenge">
    <my-header title="" rightButton="" leftBtnStyle="icon"></my-header>
    <iframe :src="fileUrl" frameborder="0" scrolling="auto" class="frame-box"></iframe>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import MyHeader from './MyHeader'

export default {
  components: {
    'my-header': MyHeader,
  },
  data() {
    return {
      fileUrl: `${this.$store.state.baseUrl}${this.$route.query.url}`
    }
  }
}
</script>

<style scoped lang="less">
.my-challenge {
  height: 100%;
  background-color: #edeef0;

  .frame-box {
    padding-top: .88rem;
    overflow: auto;
  }
}
</style>

