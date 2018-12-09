import Vue from 'vue'
import Router from 'vue-router'
import Main from '@/components/Main'
import Challenge from '@/components/Challenge'
import ChallengeDetail from '@/components/ChallengeDetail'
import MyChallenge from '@/components/MyChallenge'
import MyPlan from '@/components/MyPlan'
import CreatePlan from '@/components/CreatePlan'
import AddFile from '@/components/AddFile'
import CreateChallenge from '@/components/CreateChallenge'
import ChallengeInfo from '@/components/ChallengeInfo'
import ChooseType from '@/components/ChooseType'
import PlanDetail from '@/components/PlanDetail'
import CommentList from '@/components/CommentList'
import SearchResult from '@/components/SearchResult'
import Index from '@/components/Index'
import File from '@/components/File'
import RecommendDetail from '@/components/RecommendDetail'

// 2.0
import ProjectList from '@/pages/ProjectList'
import ProjectDetail from '@/pages/ProjectDetail'
import ProjectComment from '@/pages/ProjectComment'

Vue.use(Router)

export default new Router({
  routes: [
    {path: '/', component: Main, redirect: '/challenge', //挑战列表
      children:[
        {
          path: '/challenge',
          component: Challenge,
          meta: {
            keepAlive: true
          }
        }, {
          path: '/project',
          component: ProjectList,
          meta: {
            keepAlive: true
          }
        }
      ]
    },
    {path: '/challengedetail', component: ChallengeDetail}, //挑战详细
    {path: '/mychallenge', component: MyChallenge}, //我的挑战
    {path: '/myplan', component: MyPlan}, //我的方案
    {path: '/createplan', component: CreatePlan}, //新建方案
    {path: '/addfile', component: AddFile}, //新建方案-添加附件
    {path: '/createchallenge', component: CreateChallenge}, //新建挑战
    {path: '/challengeinfo', component: ChallengeInfo}, //新建挑战-添加描述
    {path: '/choosetype', component: ChooseType}, //新建挑战-选择类型
    {path: '/plandetail', component: PlanDetail}, //新建挑战-选择类型
    {path: '/commentlist', component: CommentList}, //评论列表
    {path: '/searchresult', component: SearchResult}, //搜索结果页面
    {path: '/index', component: Index}, //首页列表
    {path: '/file', component: File}, //文件查看
    {path: '/index/detail', component: RecommendDetail}, //推荐详情
    // 2.0
    {path: '/project/detail', component: ProjectDetail}, //项目详情
    {path: '/project/comment', component: ProjectComment}, //项目评论
  ]
})
