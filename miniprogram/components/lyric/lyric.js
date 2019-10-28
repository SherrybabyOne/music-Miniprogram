// components/lyric/lyric.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLyricShow: {
      type: Boolean,
      value: false
    },
    lyric: String
  },
  observers: {
    lyric(lrc) {
      this._parseLyric(lrc)
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    lrcList: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _parseLyric(sLyric) {
      let line = sLyric.split('\n')
      const _lrcList = []
      line.forEach((elem) => {
        let time = elem.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
        if(time) {
          let lrc = elem.split(time)[1]
          // 需要把时间转化为秒
          let timeReg = time[0].match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/)
          let time2Seconds = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3]) / 1000
          _lrcList.push({
            lrc,
            time: time2Seconds
          })
        }
      })
      console.log(_lrcList)
      this.setData({
        lrcList: _lrcList
      })
    }
  }
})
