# 云开发 quickstart

这是云开发的快速启动指引，其中演示了如何上手使用云开发的三大基础能力：

- 数据库：一个既可在小程序前端操作，也能在云函数中读写的 JSON 文档型数据库
- 文件存储：在小程序前端直接上传/下载云端文件，在云开发控制台可视化管理
- 云函数：在云端运行的代码，微信私有协议天然鉴权，开发者只需编写业务逻辑代码

## 参考文档

- [云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

在小程序中，**openid**是用户的唯一标识。


## 在小程序里，如何使用 async/await 语法？
在云函数里，由于 Node 版本最低是 8.9，因此是天然支持 async/await 语法的。而在小程序端则不然。在微信开发者工具里，以及 Android 端手机（浏览器内核是 QQ浏览器的 X5），async/await是天然支持的，但 iOS 端手机在较低版本则不支持，因此需要引入额外的 文件。可把这个 regenerator/runtime.js 文件引用到有使用 async/await 的文件当中。
`import regeneratorRuntime from '../../utils/runtime.js'`

## 云函数里进行接口调用
使用**request**和**request-promise**npm库

## 小程序云端获取数据库信息
从数据库中获取数据在云函数端限制为100条，在小程序限制为20条
突破获取数据条数的限制:
使用循环多次插入，并将数据库信息与从服务器端信息进行比较去重。
参考代码:
```
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
```

## 云函数路由优化tcb-router
### tcb-router
- 一个用户在一个云环境中只能创建50个云函数
- 相似的请求归类到同一个云函数处理
- tcb-router是一个Koa风格的云函数路由库

> 基于 koa 风格的小程序·云开发云函数轻量级类路由库，主要用于优化服务端函数处理逻辑

## 在组件中引入全局样式class的方法:
组件有样式隔离，默认不能调用外部的class名称。有三种解决方法:
- 重新在组件中新建wxss文件写入样式
- 使用自定义组件的时候传入class，在组件js文件中使用**externalClasses**,并修改自定义组件引用样式的class(不能重写外部样式)
- 取消样式隔离
  ```
  Component({
    options: {
      styleIsolation: 'apply-shared'
    }
  })
  ```

## 组件模版
在组件模版中提供一个`<slot>`节点，用于承担引用时提供的子节点。
```
<!-- 组件模板 -->
<view class="modal" hidden="{{!modalShow}}">
  <view class="panel">
    <i class="iconfont icon-shanchu1" bindtap="onClose" />
    <!-- slot插槽 具名插槽 -->
    <slot name="slot1"></slot>
    <slot name="slot2"></slot>
  </view>
</view>
```
引用组件的页面模版:
```
<x-bottom-modal modalShow="{{modalShow}}" >
  <view slot="slot2">
    <view>插槽1</view>
    <button>按钮</button>
  </view>
  <view slot="slot1">插槽2</view>
</x-bottom-modal>
```
需要多个slot时，在组件ks中声明启用:
```
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  properties: { /* ... */ },
  methods: { /* ... */ }
})
```
组件的wxml中使用多个slot，用`name`来区分;
使用时，用`slot`属性来将节点插入到不同的`slot`上。

## 冒泡和阻止冒泡
冒泡用**bind**，阻止冒泡用**catch**

## 组件间通信
- WXML数据绑定
- 事件：用于子组件向父组件传递数据，可以传递任意数据
- 父组件可以通过**this.selectComponent**方法获取子组件实例对象，这样可以直接访问组件的任意数据和方法

**触发事件**
自定义组件触发事件时，需要使用**triggerEvent**方法，指定事件名、detail对象和事件选项

## 将对数据库的操作放到云函数中
- 方便管理
- 权限管理
  - 云控制台和服务端始终有所有数据读写权限，小程序端对数据库访问权限需要单独配置

## 第六章
---

### 云数据中1对N关系的三种设计方式
- 当N不大(几个、十几个)，可以直接使用数组存储多种关系
    ```
      imgs: [
        'image1.jpg',
        'image2.jpg',
        'image3.jpg',
        'image4.jpg',
        'image5.jpg'
      ]
    ```
- 当N较大(几十个、上百个)，建立两个数据库集合，一对N添加字段(1的一方添加数组记录：另一个N集合的_id集合)，查询需要两次
- 当N非常大(上千、上万)。举个🌰:一个博客评论可能有上万个
  解决方法：建立两个集合，在N的一方集合中，存储对应的1的_id(需要查询两次)


### 取服务器端的时间
```
db.serverDate()
```

### 数据库插入操作
- 在小程序端出入数据，会自动添加上用户的**openid**
- 在云函数端调用

## 云调用
云调用是云开发提供的基于云函数使用小程序开放接口的能力，目前覆盖以下使用场景：
- 服务端调用
- 开放数据调用
- 消息推送 

### form表单
绑定发送表单事件:
```
<form slot="modal-content" report-submit="true" bindsubmit="onSend">
  <view class="edit-wrap">
    <textarea name='content' class="commont-content" placeholder="写评论" value="{{content}}" fixed="true"></textarea>
    <button class="send" form-type="submit">发送</button>
  </view>
</form>
```
在`onSend`中接收**event**:
- 表单填写内容: `event.detail.value`
- formId: `event.detail.formId`
  七天内有效，每次提交生成一个唯一的formId，在模版消息推送中必需

一个模版推送的🌰:
```
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
```
模版推送在开发者工具中不能测试，需要真机测试

### 分享功能
微信小程序开发中，分享功能只能使用`button`组件:
```
<button open-type="share">

</button> 
```
在page页面中有`onShareAppMessage`函数，在这个函数中分享:
```
onShareAppMessage: function (e) {
  let blogObj = e.target.dataset.blog
  return {
    title: obj.content,
    path: `/pages/blog-comment/blog-comment?blogId=${blogObj.blogid}`
  }
}
```