// components/blog-control/blog-control.js
let userInfo = {}
const db = wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 表示当前登录组件是否显示
    loginShow: false,
    // 底部弹出层是否显示
    modalShow: false,
    content: ''
  },
  options: {
    styleIsolation: 'apply-shared'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onComment() {
      //判断用户是否授权
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: res => {
                userInfo = res.userInfo
                // 显示评论弹出层
                this.setData({
                  modalShow: true
                })
              }
            })
          }else {
            this.setData({
              loginShow: true
            })
          }        
        }
      })
    },
    // 登录成功
    onLoginSuccess(e) {
      userInfo = e.detail
      // 授权框消失，评论框显示
      this.setData({
        loginShow: false
      }, () => {
        this.setData({
          modalShow: true
        })
      })
    },
    // 登录失败
    onLoginFail() {
      wx.showModal({
        title: '授权用户才能进行评论',
        content: '',
      })
    },
    onSend(e) {
      let content = e.detail.value.content
      const formId = e.detail.formId
      // 插入数据库
      if(content.trim() === '') {
        wx.showModal({
          title: '评论不能为空',
          content: '',
        })
        return;
      }
      wx.showLoading({
        title: '评价中',
        mask: true
      })
      db.collection('blog-comment').add({
        data: {
          content,
          createTime: db.serverDate(),
          blogId: this.properties.blogId,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        }
      }).then(res => {
        wx.hideLoading()
        wx.showToast({
          title: '评论成功',
        })
        this.setData({
          modalShow: false,
          content: ''
        })
      })

      // 推送模版消息
      wx.cloud.callFunction({
        name: 'sendMessage',
        data: {
          content,
          formId,
          blogId: this.properties.blogId
        }
      }).then(res => {
        console.log(res, '=====')
      })
    }
  }
})
