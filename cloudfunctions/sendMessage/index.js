// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()

  const result = await cloud.openapi.templateMessage.send({
    touser: OPENID,
    page: `/pages/blog-comment/blog-comment?blogId=${event.blogId}`,
    data: {
      keyword1: {
        value: event.content
      },
      keyword2: {
        value: '评价完成'
      }
    },
    templateId: 'ri1G-MsNOoyMGVeoPO6bN0sOyjP-kmisguV0qRAtZrY',
    formId: event.formId
  })
  return result
}