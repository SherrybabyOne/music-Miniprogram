// components/musiclist/musiclist.js
const app = getApp() 
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musiclist: Array 
  },

  /**
   * 组件的初始数据
   */
  data: {
    playingId: -1
  },
  pageLifetimes: {
    show() {
      this.setData({
        playingId: parseInt(app.getPlayingMusicId())
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onSelect(e) {
      const { musicid, index } = e.currentTarget.dataset
      this.setData({
        playingId: musicid
      })
      wx.navigateTo({
        url: `/pages/player/player?musicId=${musicid}&index=${index}`
      })
    }
  }
})
