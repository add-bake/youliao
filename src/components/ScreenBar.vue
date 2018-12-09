<template>
  <div class="screen-bar fix pr">
    <div class="btn-bar btn-screen l" @click="screenControl" v-if="!screenHide">筛选</div>
    <div class="btn-bar btn-sort r" @click="sortControl">{{sortCheck.text}}<i class="r"></i></div>
    <div class="screen-box pa" v-show="screenShow" :class="{active:screenAnimate}">
      <span class="arrow pa"></span>
      <div class="screen-content">
        <mt-navbar v-model="selected">
          <mt-tab-item id="1">部门</mt-tab-item>
          <mt-tab-item id="2">挑战类型</mt-tab-item>
          <mt-tab-item id="3" v-show="sortType !== 'Challenge'">创新技术</mt-tab-item>
        </mt-navbar>
        <mt-tab-container v-model="selected">
          <mt-tab-container-item id="1">
            <mt-cell title="全部" :class="{selected: departmentId === 'ALL'}" @click.native="departmentChange({text: '', id: 'ALL'})">
              <span v-show="departmentId === 'ALL'" class="icon-check"></span>
            </mt-cell>
            <mt-cell v-for="item in departmentData" :key="item.id" :title="item.text" :class="{selected: departmentId === item.id}" @click.native="departmentChange(item)">
              <span v-show="departmentId === item.id" class="icon-check"></span>
            </mt-cell>
          </mt-tab-container-item>
          <mt-tab-container-item id="2">
            <mt-cell title="全部" :class="{selected: innovateId === 'ALL'}" @click.native="innovateChange({text: '', id: 'ALL'})">
              <span v-show="innovateId === 'ALL'" class="icon-check"></span>
            </mt-cell>
            <mt-cell v-for="item in innovateData" :key="item.id" :title="item.text" :class="{selected: innovateId === item.id}" @click.native="innovateChange(item)">
              <span v-show="innovateId === item.id" class="icon-check"></span>
            </mt-cell>
          </mt-tab-container-item>
          <mt-tab-container-item id="3">
            <mt-cell title="全部" :class="{selected: technologyId === 'ALL'}" @click.native="technologyChange({text: '', id: 'ALL'})">
              <span v-show="technologyId === 'ALL'" class="icon-check"></span>
            </mt-cell>
            <mt-cell v-for="item in technologyData" :key="item.id" :title="item.text" :class="{selected: technologyId === item.id}" @click.native="technologyChange(item)">
              <span v-show="technologyId === item.id" class="icon-check"></span>
            </mt-cell>
          </mt-tab-container-item>
        </mt-tab-container>
      </div>
      <div class="screen-btn">
        <div class="btn-reset" @click="screenReset">重置</div>
        <div @click="screenSubmit">确定</div>
      </div>
    </div>
    <div class="sort-box pa" v-show="sortShow" :class="{active: sortAnimate}">
      <span class="arrow pa"></span>
      <div v-show="sortType === 'Challenge'">
        <mt-cell v-for="sortItem in sortChllenge" :key="sortItem.value" :title="sortItem.text" :class="{selected: sortItem.value===sortCheck['value']}" @click.native="sortChange(sortItem)">
          <span v-show="sortItem.value===sortCheck['value']" class="icon-check"></span>
        </mt-cell>
      </div>
      <div v-show="sortType === 'Plan'">
        <mt-cell v-for="sortItem in sortPlan" :key="sortItem.value" :title="sortItem.text" :class="{selected: sortItem.value===sortCheck['value']}" @click.native="sortChange(sortItem)">
          <span v-show="sortItem.value===sortCheck['value']" class="icon-check"></span>
        </mt-cell>
      </div>
      <div v-show="sortType === 'Project'">
        <mt-cell v-for="sortItem in sortProject" :key="sortItem.value" :title="sortItem.text" :class="{selected: sortItem.value===sortCheck['value']}" @click.native="sortChange(sortItem)">
          <span v-show="sortItem.value===sortCheck['value']" class="icon-check"></span>
        </mt-cell>
      </div>
    </div>
    <div class="popup-backdrop" v-show="screenShow" :class="{active: screenAnimate}" :style="{top: top}"></div>
  </div>
</template>

<script>
import http from '../utils/http.js'
import api from '../utils/api.js'

export default {
  props: {
    top: String,
    departmentId: {
      type: String,
      default: ''
    },
    innovateId: {
      type: String,
      default: ''
    },
    technologyId: {
      type: String,
      default: ''
    },
    sortCheck: {
      type: Object,
      default: {}
    },
    technologyShow: {
      type: Boolean,
      default: false
    },
    screenHide: {
      type: Boolean,
      default: false
    },
    sortType: {
      type: String,
      default: 'Challenge'
    }
  },
  created() {
    this.getData()
    this.getTechnology()
  },
  watch: {
    async sortType (val) {
      this.getTechnology()
    }
  },
  data() {
    return {
      selected: '1',
      screenShow: false,
      screenAnimate: false,
      sortShow: false,
      sortAnimate: false,
      sortChllenge: [{
        text: '时间排序',
        value: '5'
      },{
        text: '方案数排序',
        value: '10'
      },{
        text: '点赞排序',
        value: '15'
      }],
      sortPlan: [{
        text: '时间排序',
        value: '5'
      },{
        text: '点赞数排序',
        value: '15'
      },{
        text: '评论数排序',
        value: '20'
      }],
      sortProject: [{
        text: '时间排序',
        value: '0'
      },{
        text: '点赞数排序',
        value: '1'
      },{
        text: '评论数排序',
        value: '2'
      },{
        text: '项目进度排序',
        value: '4'
      }],
      departmentData: [],
      innovateData: [],
      technologyData: []
    }
  },
  methods: {
    // 部门筛选变化事件
    departmentChange(val) {
      this.$emit('departmentChange',val)
    },
    //挑战类型筛选变化事件
    innovateChange(val) {
      this.$emit('innovateChange',val)
    },
    //technology筛选变化事件
    technologyChange(val) {
      this.$emit('technologyChange',val)
    },
    //筛选重置事件
    screenReset() {
      this.$emit('screenReset')
      this.screenControl()
    },
    // 筛选提交事件
    screenSubmit() {
      this.$emit('screenSubmit')
      this.screenControl()
    },
    //获取页面数据
    async getData() {
      let department = await http.post({
        dictType: '10'
      },api.getVSDictType)
      let innovate = await http.post({
        dictType: '20'
      },api.getVSDictType)
      if(department.data.data.length){
        department.data.data.map( val => {
          this.departmentData.push({
            text: val.value,
            id: val.id
          })
        })
      } else {
        this.showToast('部门数据为空')
      }
      if(innovate.data.data.length){
        innovate.data.data.map( val => {
          this.innovateData.push({
            text: val.value,
            id: val.id
          })
        })
      } else {
        this.showToast('挑战类型数据为空')
      }
    },
    async getTechnology () {
      if((this.sortType === 'Project' || this.sortType === 'Plan') && !this.technologyData.length){
        let technology = await http.post({
          dictType: '30'
        },api.getVSDictType)

        if(technology.data.data.length){
          technology.data.data.map( val => {
            this.technologyData.push({
              text: val.value,
              id: val.id
            })
          })
        } else {
          this.showToast('创新技术数据为空')
        }
      }
    },
    // 筛选弹框显示隐藏
    screenControl() {
      let self = this
      this.sortShow = false
      this.sortAnimate = false
      if(!this.screenAnimate) {
        this.screenShow = true
        setTimeout(() => self.screenAnimate = !self.screenAnimate,20)
      } else {
        this.screenAnimate = !this.screenAnimate
        setTimeout(() => self.screenShow = false,400)
      }
    },
    //排序弹框显示隐藏
    sortControl() {
      let self = this
      this.screenShow = false
      this.screenAnimate = false
      if(!this.sortAnimate) {
        this.sortShow = true
        setTimeout(() => self.sortAnimate = !self.sortAnimate,20)
      } else {
        this.sortAnimate = !this.sortAnimate
        setTimeout(() => self.sortShow = false,400)
      }
    },
    sortChange(param) {
      let self = this
      this.$emit('sortChange',param)
      this.sortAnimate = !this.sortAnimate
      setTimeout(() => self.sortShow = false,400)

    }
  }
};
</script>

<style scoped lang="less">
.arrow() {
  top: -.16rem;
  left: .4rem;
  width: 0;
  height: 0;
  border-bottom: .18rem solid #fff;
  border-left: .11rem solid transparent;
  border-right: .11rem solid transparent;
}
.screen-bar {
  width: 100%;
  height: 0.72rem;
  background-color: #edeef0;
}
.btn-bar {
  padding: 0 0.2rem;
  font-size: 0.24rem;
  color: #4c566c;
  line-height: 0.72rem;
}
.btn-screen {
  padding-right: .36rem;
  background: url("../assets/images/screen.png") .73rem center no-repeat;
  background-size: .22rem .22rem;
}
.btn-sort i{
  width: .08rem;
  height: .72rem;
  margin-left: .08rem;
  background: url("../assets/images/arrow-down.png") center center no-repeat;
  background-size: .08rem .07rem;
}
.screen-box {
  left: 0;
  right: 0;
  top: .32rem;
  z-index: 999;
  opacity: 0;
  background-color: #fff;
  transition: all ease .4s;

  &.active {
    top: .72rem;
    opacity: 1;
  }

  .arrow {
    .arrow;
  }
}
.mint-navbar {
  display: block;
  width: 45.6%;
  background-color: #f5f5f5;
  .mint-tab-item {
    height: .88rem;
    padding: 0 .22rem;
    text-align: left;

    &.is-selected {
      margin-bottom: 0;
      border: none;
      color: #050505;
      background-color: #fff;
    }
  }
}
.mint-tab-container {
  width: 54.4%;
  max-height: 6.4rem;
  overflow: scroll;
  -webkit-overflow-scrolling:touch;
}
.mint-cell {
  color: #050505;
  min-height: .88rem;
  &.selected {
    font-weight: bold;
  }
}
.icon-check {
  display: block;
  width: .33rem;
  height: .23rem;
  margin-right: .2rem;
  background: url("../assets/images/check.png") center center no-repeat;
  background-size: 100% 100%;
}
.screen-btn {
  display: flex;
  height: .75rem;

  div {
    flex: 1;
    box-sizing: border-box;
    height: 100%;
    font-size: .3rem;
    color: #000;
    text-align: center;
    line-height: .75rem;
    background-color: #fdcd09;
  }
  .btn-reset {
    border: 1px solid #dadada;
    background-color: #fff;
  }
}
.screen-content {
  display: flex;
}
.mint-navbar,
.mint-tab-container {
  padding-bottom: .54rem;
}
.popup-backdrop {
  position: fixed;
  z-index: 998;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  opacity: 0;
  background: rgba(0,0,0,.5);
  -webkit-transition-duration: 400ms;
  transition-duration: 400ms;

  &.active {
    opacity: 1;
  }
}
.sort-box {
  top: .39rem;
  right: .2rem;
  z-index: 99;
  width: 2.92rem;
  border-radius: .08rem;
  box-shadow: 0 0 .58rem #d4d4d4;
  opacity: 0;
  transition: all ease .4s;
  background-color: #fff;

  &.active {
    top: .79rem;
    opacity: 1;
  }
  .arrow {
    .arrow;
    left: inherit;
    right: .54rem;
  }
  .icon-check {
    margin-right: .25rem;
  }
}
</style>
