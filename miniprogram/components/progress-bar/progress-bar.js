// components/progress-bar/progress-bar.js
let movableAreaWidth = 0
let movableViewWidth = 0
const backgroundAudioManager = wx.getBackgroundAudioManager()
// 当前秒数
let currentSec = -1 
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
    showTime: {
      currentTime: '00:00',
      totalTime: '00:00',
    },
    movableDis: 0,
    progress: 0
  },
  lifetimes: {
    ready() {
      this._getMovableDis()
      this._bindBgmEvent()
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onChange() {
      console.log(event)
    },
    onTouchEnd() {

    },
    _getMovableDis() {
      // 因为是在组件中，所以用this。如果是在页面中，用wx.
      const query = this.createSelectorQuery()
      query.select(".movable-area").boundingClientRect()
      query.select(".movable-view").boundingClientRect()
      query.exec((res) => {
        movableAreaWidth = res[0].width
        movableViewWidth = res[1].width
      })
    },
    _bindBgmEvent() {
      backgroundAudioManager.onPlay(() => {
        console.log('onPlay')
      }),
      backgroundAudioManager.onStop(() => {
        console.log('onStop')
      }),
      backgroundAudioManager.onPause(() => {
        console.log('onPause')
      }),
      backgroundAudioManager.onWaiting(() => {
        console.log('onWaiting')
      }),
      backgroundAudioManager.onCanplay(() => {
        console.log('onCanplay')
        if (backgroundAudioManager.duration !== undefined) {
          this._setTime()
        }else {
          setTimeout(() => {
            this._setTime()
          }, 1000)
        }
      }),
      backgroundAudioManager.onTimeUpdate(() => {
        console.log('onTimeUpdate')
        // 当前播放时间
        const currentTime = backgroundAudioManager.currentTime
        // 总时间
        const duration = backgroundAudioManager.duration
        // 当前播放时间格式化
        const currentTimeFormat = this._dateFormat(currentTime)
        // 当前播放时间的秒数取整
        const sec = currentTime.toString().split('.')[0]
        if(sec !== currentSec) {
          this.setData({
            movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
            progress: currentTime / duration * 100,
            ['showTime.currentTime']: `${currentTimeFormat.min}:${currentTimeFormat.sec}`
          })
          currentSec = sec
        }
      }),
      backgroundAudioManager.onEnded(() => {
        console.log('onEnded')
      })
      backgroundAudioManager.onError((res) => {
        console.log(res.errMag)
        console.log(res.errCode)
        wx.showToast({
          title: '错误' + res.errCode,
        })
      })
    },
    // 设置当前时长
    _setTime() {
      const duration = backgroundAudioManager.duration
      const durationFormat = this._dateFormat(duration)
      this.setData({
        ['showTime.totalTime']: `${durationFormat.min}:${durationFormat.sec}`
      })
    },
    // 格式化时间
    _dateFormat(duration) {
      const min = Math.floor(duration / 60)
      const sec = Math.floor(duration % 60)
      return {
        min: this._parse0(min),
        sec: this._parse0(sec)
      }
    },
    // 补0方法
    _parse0(sec) {
      return sec < 10 ? '0' + sec : sec
    },
  }
})
