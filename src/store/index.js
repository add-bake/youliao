import Vue from 'vue'
import Vuex from 'vuex'


Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    defaultHeadImg: 'this.src="'+ require('../assets/images/default-head.jpg') +'"', //默认头像
    defaultImg: 'this.src="'+ require('../assets/images/default-img.png') +'"',
    platform: '', //平台类型 1:ios 2:android
    depthHistory: [],
    sid: process.env.NODE_ENV == 'development' ? '3dd820e8b327420ab80ec0473ea1f25f' : '',
    uid: '',
    baseUrl: process.env.IMG_ROOT, //图片展示用
    planId: '',
    mainSelected: 'challenge',
    challengeSelected: '0', //记录挑战列表页页签选中状态
    projectSelected: '0', //记录项目列表页页签选中状态
    searchVal: '',
    plan: {
      planTitle: '', //方案标题
      answerContent: '', //方案内容
      technologyText: '', //挑战类型
      technologyId: '', //挑战类型id
      isPublicFile: false, //是否公开附件
      vsSquadFlag: false //是否开启组队
    },
    challenge: {
      id: '', //挑战id
      questionTitle: '', //挑战标题
      questionVs: '20', //挑战类型
      coverImgUrl: '', //封面图
      questionContent: '', //挑战内容
      vsSquadFlag: false, //是否开启组队
      vsEndDate: '', //挑战结束时间
      strimagelist: [], //挑战描述图片
      departmentId: '', //部门类型
      innovateId: '', //挑战类型
      departmentText: '', //部门类型名称
      innovateText: '', //挑战类型名称
      officialFolk: '' //创委/民间挑战 1表示创委、2表示民间
    },
    pageYOffset: ''
  },
  mutations: {
    incrementPlan(state,payload) {
      Object.assign(state.plan,payload)
    },
    incrementChallenge(state,payload) {
      Object.assign(state.challenge,payload)
    },
    updateState(state,payload){
      Object.assign(state,payload)
    },
    updateDepthHistory(state,payload) {
      let position = state.depthHistory.indexOf(payload)
      if(position > -1){
        state.depthHistory.splice(position,1)
      } else {
        state.depthHistory.push(payload)
      }
    }
  }
});
export default store
