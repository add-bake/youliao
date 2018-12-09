<template>
  <div class="nodata">
    <img :src="require(`../assets/images/nodata${iconType}.png`)">
    <p v-html="text"></p>
  </div>
</template>

<script>
export default {
  props: {
    iconType: {
      type: String,
      default: '1'
    },
    text: {
      type: String,
      default: '你还没有提出过挑战哦~'
    }
  }
}
</script>

<style scoped lang="less">
.nodata {
  padding-top: 3.64rem;
  img {
    display: block;
    width: 2.84rem;
    height: 2.4rem;
    margin: 0 auto;
  }
  p {
    padding: 0 1rem;
    font-size: .4rem;
    text-align: center;
    line-height: 1rem;
    color: rgba(37, 37, 37, .56);
  }
}
</style>
