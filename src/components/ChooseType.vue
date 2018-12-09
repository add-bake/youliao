<template>
  <div class="create-challenge">
    <my-header title="选择类型" rightButton="发布" :rightUnable="rightUnable" @nextStep="nextStep"></my-header>
    <div class="content">
      <p class="info pr bd">请根据如下内容选择挑战的类型(必填)</p>
      <field-picker 
        fieldTitle="部门"
        require
        :fieldOptions="departmentData"
        :fieldValue="challenge.departmentText"
        @fieldChange="departmentChange">
      </field-picker>
      <field-picker 
        fieldTitle="挑战类型"
        require
        :fieldOptions="innovateData"
        :fieldValue="challenge.innovateText"
        @fieldChange="innovateChange">
      </field-picker>
    </div>
  </div>
</template>

<script>
import qs from 'qs'
import FieldPicker from './FieldPicker.vue'
import {mapState, mapMutations} from 'vuex'
import http from '../utils/http.js'
import api from '../utils/api.js'

export default {
  components: {
    'field-picker': FieldPicker
  },
  created() {
    this.getData()
  },
  data() {
    return {
      rightUnable: true,
      departmentData: [],
      departmentValue: [],
      innovateData: [],
      innovateValue: []
    }
  },
  computed: {
    ...mapState(['sid','challenge'])
  },
  methods: {
    ...mapMutations(['incrementChallenge','updateDepthHistory']),
    async nextStep() {
      if(this.challenge.departmentText === ''){
        return this.showToast('部门是必选的')
      }
      if(this.challenge.innovateText === ''){
        return this.showToast('挑战类型是必选的')
      }
      if(this.challenge.officialFolk === ''){
        return this.showToast('未获取到挑战类型')
      }
      this.showLoading()
      let params = this.challenge
      params.vsSquadFlag = params.vsSquadFlag ? 1 : 2
      params.coverImgUrl = params.coverImgUrl ? params.coverImgUrl.split(',')[1] : ''
      params.strimagelist.map((value, index) => {
        params.strimagelist[index] = value.split(',')[1]
      })
      let res = await http.post(params,api.insertVersus)
      this.hideLoading()
      if(res.data.errormsg === ''){
        let rewardInfo = res.data.data.rewardInfo
        this.$bus.$emit('challengeUpdate')
        this.showToast(`创建成功${rewardInfo && rewardInfo.reward && rewardInfo.reward > 0 ? '，积分+' + rewardInfo.reward : ''}`)
        this.incrementChallenge({
          coverImgUrl: '',
          departmentId: '',
          departmentText: '',
          innovateId: '',
          innovateText: '',
          officialFolk: '',
          questionContent: '',
          questionTitle: '',
          questionVs: '',
          strimagelist: [],
          vsEndDate: '',
          vsSquadFlag: ''
        })
        this.updateDepthHistory('/choosetype')
        this.updateDepthHistory('/challengeinfo')
        this.updateDepthHistory('/createchallenge')
        this.$router.go(-3)
      } else {
         this.showAlert(res.data.errormsg)
      }
    },
    departmentChange(result){
      if(result.index >= 0){
        this.incrementChallenge({departmentText: result.value, departmentId: this.departmentValue[result.index]})
      } else {
        this.incrementChallenge({departmentText: '',departmentId: ''})
      }
      this.checkStatus()
    },
    innovateChange(result){
      if(result.index >= 0){
        this.incrementChallenge({innovateText: result.value, innovateId: this.innovateValue[result.index]})
      } else {
        this.incrementChallenge({innovateText: '',innovateId: ''})
      }
      this.checkStatus()
    },
    async getData() {
      this.showLoading()
      let department = await http.post({
        dictType: '10'
      },api.getVSDictType)
      let innovate = await http.post({
        dictType: '20'
      },api.getVSDictType)
      let officialFolk = await http.get(api.getLoginUserIsOfficial,{
        __sid: this.sid
      })
      this.hideLoading()
      if(department.data.data.length){
        department.data.data.map( val => {
          this.departmentData.push(val.value)
          this.departmentValue.push(val.id)
        })
      } else {
        this.showToast('部门数据为空')
      }
      if(innovate.data.data.length){
        innovate.data.data.map( val => {
          this.innovateData.push(val.value)
          this.innovateValue.push(val.id)
        })
      } else {
        this.showToast('挑战类型数据为空')
      }
      this.incrementChallenge({officialFolk: officialFolk.data.data ? '1' : '2'})
      this.checkStatus()
    },
    checkStatus() {
      if(this.challenge.departmentText !== '' && this.challenge.innovateText !== '' && this.challenge.officialFolk !== '') {
        this.rightUnable = false
      } else{
        this.rightUnable = true
      }
    }
  }
}
</script>

<style lang="less" scoped>
.bd(){
  position: absolute;
  content: '';
  left: .45rem;
  right: 0;
  bottom: 0;
  z-index: 1;
  height: 1px;
  background-color: #eee;
}
.info {
  padding: 0 .52rem;
  font-size: .32rem;
  color: #000;
  line-height: 1.1rem;

  &::after {
    .bd();
  }
}
</style>
