# A React Native APP for JFinal([www.jfinal.com](http://www.jfinal.com))

基本实现思路：通过与浏览器相同的HTTP请求1）获取HTML并解析（基于cheerio，类JQuery的HTML解析库）为可用数据，在APP上相应地显示；2）执行如创建分享、回复、私信、登录、注册等等操作。

## 基础框架

React Native + Mobx。

## 开发语言

TypeScript。

## 导航库

- react-native-router-flux

## 使用到的UI库

- react-native-material-ui：Toolbar、Navigation Bar、Card、Button、ActionButton
- react-native-elements：Button、Input
- antd-mobile-rn：抽屉、Modal、Toast
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