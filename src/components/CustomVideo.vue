<template>
  <div
    class="custom-video"
    v-if="videoPoster">
    <video
      class="video"
      controls="controls"
      preload="auto"
      :poster="poster"
      :src="videoUrl">
    </video>
  </div>
</template>

<script>
import {mapState} from 'vuex'

export default {
  props: {
    id: String,
    videoUrl: String,
    videoPoster: String
  },
  data () {
    return {}
  },
  computed: {
    ...mapState(['baseUrl']),
    poster () {
      return `${this.baseUrl}${this.videoPoster}`
    }
  }
}
</script>

<style lang="less" scoped>
.custom-video {
  width: 100%;
  box-sizing: border-box;
  padding: 0 .2rem;
  overflow: hidden;
  .video {
    width: 100%;
    border-radius: 3px;
  }
}
</style>
