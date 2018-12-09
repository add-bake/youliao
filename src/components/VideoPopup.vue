<template>
  <div>
    <div
      class="btn-play-box pr"
      v-if="btnShow"
      @click="popupShowControl">
      <img
        :src="poster"
        :onerror="defaultImg"
        alt="btn play">
      <span class="btn-play pa"></span>
    </div>
    <div class="video-popup">
      <div class="popup" v-show="popupShow" :class="{cur: popupAnimate}">
        <video
          ref="video"
          class="video-popup-content"
          controls="controls"
          preload="auto"
          :poster="poster"
          :src="videoSrc">
        </video>
        <div class="popup-close" @click="popupClose"></div>
      </div>
      <div class="popup-backdrop" :class="{cur: popupBackdropAnimate}"></div>
    </div>
  </div>
</template>

<script>
import http from '../utils/http.js'
import api from '../utils/api.js'
import {mapState} from 'vuex'

export default {
  props: {
    id: String,
    videoUrl: String,
    videoPoster: String,
    btnShow: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      popupBackdropAnimate: false,
      popupShow: false,
      popupAnimate: false,
      videoSrc: this.videoUrl,
      poster: this.videoPoster,
      defaultImg: 'this.src="'+ require('../assets/images/default-img.png') +'"'
    }
  },
  watch: {
    videoUrl (newValue) {
      this.videoSrc = newValue
    },
    videoPoster (newValue) {
      this.poster = `${this.baseUrl}${newValue}`
    }
  },
  computed: {
    ...mapState(['baseUrl'])
  },
  methods: {
    async popupShowControl () {
      if (!this.videoSrc && !this.id) return this.showToast('无法获取视频地址')
      if (this.id && !this.videoSrc) {
        this.showLoading()
        let {data} = await http.post({
          videoId: this.id
        }, api.getVideo)
        this.hideLoading()
        if (data.status === 'success') {
          this.videoSrc = data.data
          this.$nextTick(() => {
            this.$refs.videoPopup.popupShowControl()
          })
        } else {
          this.showToast(data.errormsg)
        }
      } else if (this.videoSrc) {
        this.popupShow = true
        setTimeout(() => {
          this.popupAnimate = true
          this.popupBackdropAnimate = true
        }, 10)
        this.$nextTick(() => {
          this.$refs.video.play()
        })
      }
    },
    popupClose () {
      this.$refs.video.pause()
      this.popupAnimate = false
      this.popupBackdropAnimate = false
      setTimeout(() => {
        this.popupShow = false
      },400)
    }
  }
}
</script>

<style lang="less" scoped>
.btn-play-box {
  width: 100%;
  box-sizing: border-box;
  padding: 0 .2rem;
  overflow: hidden;
  img {
    display: block;
  }
}
.video-popup {
  .popup {
    width: 7rem;
  }
  .video-popup-content {
    width: 100%;
    height: auto;
    max-height: 500px;
  }
}
</style>

