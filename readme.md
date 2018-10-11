# A React Native APP for JFinal([www.jfinal.com](http://www.jfinal.com))

基本实现思路：通过与浏览器相同的HTTP请求1）获取HTML并解析（基于cheerio，类JQuery的HTML解析库）为可用数据，在APP上相应地显示；2）执行如创建分享、回复、私信、登录、注册等等操作。

## 基础框架

React Native 0.57

## 开发语言

TypeScript。

## 状态管理

- Mobx

## 导航库

- react-native-router-flux

## 使用到的UI库

- react-native-material-ui：Toolbar、Navigation Bar、Card、Button、ActionButton
- react-native-elements：Button、Input
- antd-mobile-rn：Drawer、Modal、Toast
- react-native-render-html：（将HTML渲染为RN组件）
- react-native-tab-view：TabView
- teaset：Overlay、SearchInput

## HTML解析器

- cheerio（react-native-cheerio）

## 网络请求库

- axios
- rn-fetch-blob（原生请求，可更改HTTP Headers）

## 全文搜索

使用[bing.com](https://cn.bing.com)搜索`site:www.jfinal.com 关键字`的结果。(使用rn-fetch-blob模拟PC端请求)

## IOS

没有MAC为IOS构建APP。幸好，RN是跨平台的，此外本程序所有原生库的安装都使用自动link，应该能轻易的为IOS构建。此外还需要Xcode更改图标。

## 预览

首页/项目

![image](https://github.com/weifuchuan/JFinal/blob/master/_preview/home_project.png)

首页/分享

![image](https://github.com/weifuchuan/JFinal/blob/master/_preview/home_share.png)

首页/搜索

![image](https://github.com/weifuchuan/JFinal/blob/master/_preview/home_search.png)

首页/我

![image](https://github.com/weifuchuan/JFinal/blob/master/_preview/home_me.png)

首页/我/抽屉

![image](https://github.com/weifuchuan/JFinal/blob/master/_preview/home_me_drawer.png)

项目页

![image](https://github.com/weifuchuan/JFinal/blob/master/_preview/project_page.png)

分享页

![image](https://github.com/weifuchuan/JFinal/blob/master/_preview/share_page.png)

创建分享

![image](https://github.com/weifuchuan/JFinal/blob/master/_preview/edit_share.png)

用户

![image](https://github.com/weifuchuan/JFinal/blob/master/_preview/user.png)

用户/抽屉

![image](https://github.com/weifuchuan/JFinal/blob/master/_preview/user_drawer.png)

私信列表

![image](https://github.com/weifuchuan/JFinal/blob/master/_preview/msg_list.jpg)

发送私信

![image](https://github.com/weifuchuan/JFinal/blob/master/_preview/message.png)

推送通知

![image](https://github.com/weifuchuan/JFinal/blob/master/_preview/msg_push.png)

## 更新日志  

### 1.0.10-beta

为Android添加热更新。

热更新服务：[pushy](https://github.com/reactnativecn/react-native-pushy)

** Note：pushy正在为React Native 0.57修复，暂不能使用。 **

### 1.0.9-beta

头像加圆角。

### 1.0.8-beta

修复EditArticle组件的在网络状况不佳时偶尔会出现的bug。

### 1.0.7-beta

修复小bug。

### 1.0.6-beta

添加简单的依托于github release的安卓上的APP更新。

### 1.0.5-beta

优化收藏、点赞逻辑。

### 1.0.4-beta

分享文章跨平台化。

### 1.0.3-beta

扁平化项目、分享、反馈、动态列表的item组件。

### 1.0.2-beta

可触摸的组件更改为全平台都使用涟漪反馈效果。

### 1.0.1-beta

未登录下，提交回复跳到登录页。

### 1.0.0-beta

Covering almost all features of jfinal.com .

## License 

[Apache License 2.0](https://github.com/weifuchuan/JFinal/blob/master/LICENSE)