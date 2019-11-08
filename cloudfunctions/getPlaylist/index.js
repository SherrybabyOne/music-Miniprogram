// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

const rp = require('request-promise')

const URL = 'http://musicapi.xiecheng.live/personalized'

const playlistCollection = db.collection('playlist')

// 每次获取数据库的最大条数
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  // 从数据库取数据
  // const list = await playlistCollection.get()
  const countResult = await playlistCollection.count()
  const total = countResult.total
  const batchTimes = Math.ceil(total / MAX_LIMIT)
  const tasks = []
  for(let i = 0; i < batchTimes; i++) {
    const promise = playlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  let list = {
    data: []
  }
  if(tasks.length > 0) {
    list = (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data)
      }
    })
  }
  // 从服务器端取数据
  const playlist = await rp(URL).then(res => {
    return JSON.parse(res).result
  })
  // 用于去重数据库信息
  const newData = []
  for(let i = 0; i < playlist.length; i++) {
    let flag = true
    for(let j = 0; j < list.data.length; j++) {
      if(playlist[i].id === list.data[j].id) {
        flag = false
        break
      }
    }
    if(flag) {
      newData.push(playlist[i])
    }
  }
  // 向数据库中插入数据
  for(let i = 0; i < newData.length; i++) {
    await playlistCollection.add({
      data: {
        ...newData[i],
        createTime: db.serverDate()
      }
    }).then(res => {
      console.log('插入成功')
    }).catch(err => {
      console.log('出入失败')
    })
  }

  return `一共插入了${newData.length}条信息`

  // const wxContext = cloud.getWXContext()

  // return {
  //   event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  // }
}