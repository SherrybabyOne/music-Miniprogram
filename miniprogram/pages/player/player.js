// pages/player/player.js
let musiclist = []
// 正在播放歌曲的index
let nowPlayingIndex = 0
// 获取全局背景唯一的背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl: '',
    isPlaying: false, //false代表不播放，true代表正在播放
    isLyricShow: false,
    lyric: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    musiclist = wx.getStorageSync('musiclist')
    nowPlayingIndex = options.index
    this._loadMusicDetail(options.musicId)
  },
  _loadMusicDetail(musicId) {
    backgroundAudioManager.stop()
    let music = musiclist[nowPlayingIndex]
    console.log(music, 'music')
    wx.setNavigationBarTitle({
      title: music.name,
    })
    this.setData({
      picUrl: music.al.picUrl,
      isPlaying: false
    })
    wx.showLoading({
      title: '歌曲加载中',
    })
    wx.cloud.callFunction({
      name: 'music',
      data: {
        musicId,
        $url: 'musicUrl'
      }
    }).then(res => {
      console.log(JSON.parse(res.result))
      const result = JSON.parse(res.result)
      backgroundAudioManager.src = result.data[0].url
      backgroundAudioManager.title = music.name
      backgroundAudioManager.coverImgUrl = music.al.picUrl
      backgroundAudioManager.singer = music.ar[0].name
      backgroundAudioManager.epname = music.al.name
    })
    this.setData({
      isPlaying: true
    })
    wx.hideLoading()
    // 加载歌词
    wx.cloud.callFunction({
      name: 'music',
      data: {
        musicId,
        $url: 'lyric', 
      }
    }).then(res => {
      let lyric = '暂无歌词'
      const lrc = JSON.parse(res.result).lrc
      if(lrc) {
        lyric = lrc.lyric
      }
      this.setData({
        lyric
      })
    })
  },
  // 点击暂停/播放触发事件
  togglePlaying() {
    // 正在播放
    if(this.data.isPlaying) {
      backgroundAudioManager.pause()
    }else {
      backgroundAudioManager.play()
    }
    this.setData({
      isPlaying: !this.data.isPlaying
    })
  },
  // 上一首
  onPrev() {
    nowPlayingIndex--
    if(nowPlayingIndex < 0) {
      nowPlayingIndex = musiclist.length - 1
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  // 下一首
  onNext() {
    nowPlayingIndex++
    if(nowPlayingIndex === musiclist.length - 1) {
      nowPlayingIndex = 0
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  // 控制歌词页面的显示
  onChangeLyricShow() {
    this.setData({
      isLyricShow: !this.data.isLyricShow
    })
  },
  timeUpdate(event) {
    this.selectComponent('.lyric').update(event.detail.currentTime)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})