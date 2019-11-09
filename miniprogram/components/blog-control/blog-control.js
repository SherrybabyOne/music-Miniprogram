// components/blog-control/blog-control.js
let userInfo = {}
Component({
  /**
   * 组件的属性列表
   */
  properties: {

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
    onLoginSuccess() {
      // 授权框消失，评论框显示
      this.setData({
        loginShow: false
      }, () => {
        this.setData({
          modalShow: true
        })
      })
    },
    onLoginFail() {
      wx.showModal({
        title: '授权用户才能进行评论',
        content: '',
      })
    }
  }
})
