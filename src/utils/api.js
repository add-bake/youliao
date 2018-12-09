export default {
  getVSDictType: '/Versus/GetVSDictType', //获取挑战的类型标签
  getLoginUserIsOfficial: '/User/GetLoginUserIsOfficial', //获取当前登陆用户是否是创委角色,
  insertVersus: '/Versus/InsertVersus', //新增挑战
  getAllOrNeedVersus: '/Versus/getAllOrNeedVersus', //挑战列表
  getAllPlanlist: '/Plan/getAllPlanlist', //全部方案列表
  getVersusInfo: '/Versus/getVersusInfo', //查看挑战详情
  getPlanListByBelongVersus: '/Plan/GetPlanListByBelongVersus', //查看所属挑战的方案列表
  insertPlan: '/Plan/InsertPlan', //新增方案
  uploadPlanFiles: '/Plan/uploadPlanFiles', //上传方案附件
  getMyVersusList: '/Versus/getMyVersusList', //我的挑战
  getPlanlistByUserId: '/Plan/getPlanlistByUserId', //我的方案
  insertApplyParticipative: '/ApplyParticipative/InsertApplyParticipative', //申请参与
  getPlanInfoById: '/Plan/GetPlanInfoById', //方案详情
  getReplyAndCriticizeLists: '/Criticize/getReplyAndCriticizeLists', //查看方案、项目的评论列表
  criticizeInsert: '/Criticize/insertReplyCriticizes', //评论方案、项目
  updateuploadPlanFiles: '/Plan/UpdateuploadPlanFiles', //编辑附件
  dealUpvote: '/Upvote/DealUpvote', //点赞接口
  updatePlan: '/Plan/UpdatePlan', //更新方案及图片
  /* 草稿 */
  GetPlanDraftByparentId: '/Draft/GetPlanDraftByparentId', //根据更新时间获取最新一条
  getDraftByTypeId: '/Draft/GetDraftByTypeId', //根据类型和id获取草稿
  saveDraft: '/Draft/SaveDraft', //新增草稿
  deleteDraft: '/Draft/deleteDraftById', //删除草稿
  /* 项目 */
  getProjectListAll: '/Project/getProjectListAll', //查看项目列表
  getProjectDetail: '/Project/queryProjectById', //根据项目id查看项目详细
  /* 搜索 */
  filterSearch: '/GlobalFilter/H5GlobalFilterSearch',
  getChallengeByTitle: '/Question/queryQuestionByQuestionTittle', //挑战标题关键字查询
  /* 推荐页面 */
  getRecommendList: '/Recommend/queryRecommendLimit12', // 查看推荐列表
  getRecommendById: '/Recommend/queryRecommendById', // 查看推荐详细
  insertVideo: 'UploadVideo/insertVideo', // 上传视频
  deleteVideo: 'UploadVideo/deleteVideoByFkeyId', //删除视频
  getVideo: 'UploadVideo/getVideoUrlByVideoId' //获取视频
}