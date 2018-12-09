<template>
  <div id="app">
    <transition
      :name="transitionName"
      mode="out-in">
      <keep-alive key="alive">
        <router-view
          v-if="$route.meta.keepAlive">
        </router-view>
      </keep-alive>
    </transition>
    <transition
      :name="transitionName"
      mode="out-in">
      <router-view
        key="noAlive"
        v-if="!$route.meta.keepAlive">
      </router-view>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      transitionName: ''
    }
  },
  watch: {
    '$route' (to, from) {
      let className = 'slide-left'
      if(this.$store.state.depthHistory.indexOf(to.path) > -1){
        className = 'slide-right'
        this.$store.commit('updateDepthHistory',to.path)
      } else {
        this.$store.commit('updateDepthHistory',from.path)
      }
      if (from.meta.index === undefined && to.meta.index === 1) {
        className = ''
      }
      this.transitionName = className
      
    }
  }
}
</script>

<style>
#app {
  height: 100%;
}
.slide-right-enter, .slide-left-leave-to {
  opacity: 0;
  transform: translateX(-10%);
}
.slide-right-leave-to, .slide-left-enter {
  opacity: 0;
  transform: translateX(10%);
}
.slide-right-enter-active, .slide-right-leave-active,
.slide-left-enter-active, .slide-left-leave-active {
  transition: opacity 0.15s ease-out, transform 0.15s ease-out;
}
</style>
