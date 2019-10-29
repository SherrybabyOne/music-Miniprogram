// components/progress-bar/progress-bar.js
let movableAreaWidth = 0
let movableViewWidth = 0
const backgroundAudioManager = wx.getBackgroundAudioManager()
// 当前秒数
let currentSec = -1
// 当前歌曲总时长,以s为单位
let duration = 0
// 表示当前进度条是否在拖拽,解决进度条拖动的时候和updatetime事件有冲突的问题
let isMoving = false
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame: Boolean
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
      if (this.properties.isSame && this.data.showTime.totalTime === '00:00') {
        this._setTime()
      }
      this._getMovableDis()
      this._bindBgmEvent()
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onChange({detail}) {
      if(detail.source === 'touch') {
        this.data.progress = detail.x / (movableAreaWidth - movableViewWidth) * 100
        this.data.movableDis = detail.x
        isMoving = true
      }
    },
    onTouchEnd() {
      backgroundAudioManager.seek(duration * this.data.progress / 100)
      const currentTimeFormat = this._dateFormat(Math.floor(backgroundAudioManager.currentTime))
      this.setData({
        progress: this.data.progress,
        movableDis: this.data.movableDis
      })
      isMoving = false
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
        isMoving = false
        this.triggerEvent('musicPlay')
      }),
      backgroundAudioManager.onStop(() => {
      }),
      backgroundAudioManager.onPause(() => {
        this.triggerEvent('musicPause')
      }),
      backgroundAudioManager.onWaiting(() => {
      }),
      backgroundAudioManager.onCanplay(() => {
        if (backgroundAudioManager.duration !== undefined) {
          this._setTime()
        }else {
          setTimeout(() => {
            this._setTime()
          }, 1000)
        }
      }),
      backgroundAudioManager.onTimeUpdate(() => {
        if (!isMoving) {
          // 当前播放时间
          const currentTime = backgroundAudioManager.currentTime
          // 总时间
          const duration = backgroundAudioManager.duration
          // 当前播放时间格式化
          const currentTimeFormat = this._dateFormat(currentTime)
          // 当前播放时间的秒数取整
          const sec = currentTime.toString().split('.')[0]
          if (sec !== currentSec) {
            this.setData({
              movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
              progress: currentTime / duration * 100,
              ['showTime.currentTime']: `${currentTimeFormat.min}:${currentTimeFormat.sec}`
            })
            currentSec = sec
            // 联动歌词
            this.triggerEvent('timeUpdate', {
              currentTime
            })
          }
        }
        
      }),
      backgroundAudioManager.onEnded(() => {
        this.triggerEvent('musicEnd')
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
      duration = backgroundAudioManager.duration
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
