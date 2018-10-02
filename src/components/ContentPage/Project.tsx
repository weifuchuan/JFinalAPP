import React from 'react';
import { View, StyleSheet, ViewStyle, Text, ActivityIndicator, Alert } from 'react-native';
import { observer, inject } from 'mobx-react/native';
import { Store } from '../../store';
import { Project as ProjectModel, AccountInPage } from '../../types';
import { observable, runInAction } from 'mobx';
import BasePage from './BasePage';
import { req, favorite, like } from '../../store/web';
import { retryDo } from '../../kit';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../base/kit';
import { ICON_BLUE } from '../base/color'; 
import { baseUrl } from '../../store/req';
import { Toast, Modal } from 'antd-mobile-rn';
const cheerio: CheerioAPI = require('react-native-cheerio');
import { ActionSheet } from 'antd-mobile-rn';
import Router from '../Router';

interface Props {
	store?: Store;
	id: number;
}

// const cache: Map<number, [ProjectModel, AccountInPage]> = new Map();

@inject('store')
@observer
export default class Project extends React.Component<Props> {
	@observable
	project: ProjectModel = {
		id: 0,
		accountId: 0,
		name: '',
		title: '',
		content: '',
		createAt: '',
		clickCount: 0,
		report: 0,
		likeCount: 0,
		favoriteCount: 0
	};

	@observable favorited: boolean = false;
	@observable liked: boolean = false;

	@observable
	author: AccountInPage = {
		id: 0,
		nickName: '',
		avatar: ''
	};

	@observable loading = false;

	render() {
		return (
			<View style={styles.container}>
				<BasePage
					onShare={this.onShare}
					onFavorite={this.onFavorite}
					onLike={this.onLike}
					html={this.project.content}
					centerElementInTopBar={this.project.title}
					favoriteCount={this.project.favoriteCount}
					likeCount={this.project.likeCount}
					onWebViewEmit={this.onWebViewEmit}
					favorited={this.favorited}
					liked={this.liked}
				/>
				<ActivityIndicator animating={this.loading} style={styles.loading} color={ICON_BLUE} />
			</View>
		);
	}

	private onFavorite = async () => {
		if (!this.props.store!.me) {
			Router.login();
			return;
		}
		const ret = await favorite('project', this.project.id, !this.favorited);
		if (ret.isOk) {
			runInAction(() => {
				this.favorited = !this.favorited;
				this.project.favoriteCount++;
			});
			Toast.success(`${this.favorited ? '' : '取消'}收藏成功`, 0.8);
		} else {
			Toast.fail(ret.get('msg'), 1.5);
		}
	};

	private onLike = async () => {
		if (!this.props.store!.me) {
			Router.login();
			return;
		}
		const ret = await like('project', this.project.id, !this.liked);
		if (ret.isOk) {
			runInAction(() => {
				this.liked = !this.liked;
				this.project.likeCount++;
			});
			this.liked = !this.liked;
			Toast.success(`${this.liked ? '' : '取消'}点赞成功`, 1.5);
		} else {
			Toast.fail(ret.get('msg'), 1.5);
		}
	};

	private onShare = () => {
		ActionSheet.showShareActionSheetWithOptions({
			url: `${baseUrl}/project/${this.props.id}`,
			message: this.project.title + ` ${baseUrl}/project/${this.props.id}`,
			title: '分享'
		});
	};

	webviewHandler = function(payload: any) {};

	onWebViewEmit = (payload: any) => {
		if (payload.action === 'openUser') {
			if (this.props.store!.me && this.props.store!.me!.id === payload.id) {
				Modal.alert('跳转到我的主页？', '将无法返回此页', [
					{ text: '确认', onPress: () => Router.me() },
					{ text: '取消', onPress: () => null }
				]);
			} else 
			Router.user(payload.id);
		} else if (payload.action === 'openProject') {
			if (payload.id) {
				Router.projectPage(payload.id);
			} else {
				Router.project();
			}
		} else if (payload.action === 'openShare') {
			if (payload.id) {
				Router.sharePage(payload.id);
			} else {
				Router.share();
			}
		} else if (payload.action === 'openFeedback') {
			if (payload.id) {
				Router.feedbackPage(payload.id);
			} else {
				Router.feedback();
			}
		}
	};

	componentDidMount() {
		// if (cache.has(this.props.id)) [ this.project, this.author ] = cache.get(this.props.id)!;
		// else
		(async () => {
			this.loading = true;
			try {
				const html = await retryDo(async () => {
					const resp = await req.GET(`/project/${this.props.id}`, null, {
						responseType: 'text'
					});
					return resp.data;
				}, 3);
				const $ = cheerio.load(html);
				runInAction(() => {
					this.project.id = this.props.id;
					let avatar = $('.jf-article-meta > a > img').attr('src');
					this.author.avatar = avatar;
					this.author.nickName = $('.jf-article-meta > a > span').text().trim();
					const authorUri = $('.jf-article-meta > a').attr('href');
					this.author.id = Number.parseInt(authorUri.substring(authorUri.lastIndexOf('/') + 1));
					this.project.title = $('.jf-article-title').text().trim();
					this.project.createAt = $('.jf-article-create-at').text().trim();
					this.favorited = $('i.iconfont.icon-favorite').hasClass('active');
					this.liked = $('i.iconfont.icon-like').hasClass('active');
					this.project.content = `
						<html>
							<head>
								${$('head').html()}
								<style>
									body{
										background-color:#ffffff  !important;
									}
									.jf-panel-box {
										width: 100% !important;
										line-height: 1.5;
										font-size: 18px;
									}
									pre{
										overflow: auto;
									}
									pre li {
										white-space: nowrap; 
									}
									.jf-article{
										margin: 0 !important; 
										padding: 0 10px 0 10px !important;
										box-shadow: none !important;
    								border: none !important;
									}
									.jf-article-title{
										text-align:start; 
									}
								</style>
							</head>
							<body> 
								<div class="jf-panel-box">
									<div class="jf-article">
										<h1 class="jf-article-title">${this.project.title}</h1>
										<div class="jf-article-meta">
											<a id="author">
												<img src="${avatar}">
												<span>${this.author.nickName}</span>
											</a>
											<span class="jf-article-create-at">${this.project.createAt}</span>
										</div>
										<div class="jf-article-content">
											${$('.jf-article-content').html()}
										</div>
									</div>
								</div>  
								<script src="https://cdn.bootcss.com/zepto/1.2.0/zepto.min.js"></script><script src="https://cdn.jsdelivr.net/npm/zepto.touch@1.0.3/zepto.touch.min.js"></script>
								<script type="text/javascript" src="/assets/prettify/prettify.js"></script>
								<script type="text/javascript">
									$(document).ready(function() {
										$("pre").addClass("prettyprint linenums");
										prettyPrint();

										try{
											$("img").each(function(){
												if ($(this).attr("src").match(/\?\w+=/)){
													$(this).attr("src", $(this).attr("src")+"&noCache="+Math.random()); 
												}else{
													$(this).attr("src", $(this).attr("src")+"?noCache="+Math.random()); 
												}
											});
										}catch(e){}

										$("#author").on("tap", function(){ 
											send({action:"openUser", id: ${this.author.id}}); 
										}); 
										
										var map = new Map(); 
										function regOne(elem, eventName, handler){
											if (!map.has(elem)){
												map.set(elem, new Map());
											}
											if (!map.get(elem).has(eventName)){
												$(elem).on(eventName, handler);
												map.get(elem).set(eventName, true); 
											}
										}

										function regEvent(){
											[
												{name:"project", action:"openProject"}, 
												{name:"share", action:"openShare"}, 
												{name:"feedback", action:"openFeedback"},
												{name:"user", action:"openUser"},
											].forEach(function(item){
												$('a[href^="' + "/" + item.name + '"]').each(function(){
													var elem = $(this); 
													regOne(this, "tap", function(evt){
														evt.preventDefault(); 
														var href = elem.attr("href"); 
														if (href==='/'+item.name){
															send({action:item.action}); 	
														}else{
															send({
																action:item.action, 
																id: Number.parseInt(href.substring(href.lastIndexOf("/")+1))
															}); 
														}
													})
												});
											});	
										}
										regEvent(); 
									});
								</script>
							</body>
						</html>
					`;
					this.project.favoriteCount = Number.parseInt(
						$(
							'body > div.jf-body-box.clearfix > div.jf-panel-box.jf-pull-left > div > div.jf-article-footer.clearfix > div > span:nth-child(2)'
						)
							.text()
							.trim() || '0'
					);
					this.project.likeCount = Number.parseInt(
						$(
							'body > div.jf-body-box.clearfix > div.jf-panel-box.jf-pull-left > div > div.jf-article-footer.clearfix > div > span:nth-child(4)'
						)
							.text()
							.trim() || '0'
					);
					this.loading = false;
				});
			} catch (e) {
				Alert.alert('网络请求错误', e.toString(), [ { text: 'OK', onPress: () => Router.pop() } ], {
					cancelable: false
				});
				this.loading = false;
			}
		})();

		// if (!addCacheClear) {
		// 	addCacheClear = true;
		// 	this.props.store!.addListener('clearCache', this.clearCache);
		// }
	}

	// clearCache() {
	// 	cache.clear();
	// }

	// componentWillUnmount() {
	// 	cache.set(this.props.id, [ this.project, this.author ]);
	// }
}

const styles = StyleSheet.create({
	container: { flex: 1 } as ViewStyle,
	loading: {
		position: 'absolute',
		width: SCREEN_WIDTH,
		height: SCREEN_HEIGHT,
		justifyContent: 'center',
		alignItems: 'center'
	} as ViewStyle
});

let addCacheClear: boolean = false;
