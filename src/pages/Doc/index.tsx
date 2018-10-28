import { SCREEN_HEIGHT, SCREEN_WIDTH } from '@/components/kit';
import WebView from '@/components/WebView';
import Router from '@/router';
import { Store } from '@/store';
import { ICON_BLUE, BACK_WHITE } from '@/themes/color';
import { Drawer, Modal } from 'antd-mobile-rn';
import { observable, IReactionDisposer, autorun, runInAction } from 'mobx';
import { inject, observer } from 'mobx-react/native';
import React from 'react';
import { ActivityIndicator, SectionList, StyleSheet, Text, View, ViewStyle, SectionListData } from 'react-native';
import { Toolbar } from 'react-native-material-ui';
import { GET_HTML } from '@/kit/req';
import Touchable from '@/components/Touchable';
import StatusBar from '@/components/StatusBar';
import { Observer } from 'mobx-react';
const cheerio: CheerioAPI = require('react-native-cheerio');

interface Props {
	store?: Store;
	uri?: string;
}

interface Section {
	title: string;
	data: SectionItem[];
}

interface SectionItem {
	title: string;
	uri: string;
	active: boolean;
}

@inject('store')
@observer
export default class Doc extends React.Component<Props> {
	@observable title = '文档';
	@observable html = '';
	@observable loading = false;
	@observable openDrawer = false;
	@observable sections: Section[] = [];

	webview: WebView | null = null;

	render() {
		return (
			<Drawer
				position="left"
				open={this.openDrawer}
				onOpenChange={(isOpen) => (this.openDrawer = isOpen)}
				drawerWidth={260}
				sidebar={
					<View style={styles.sidebar}>
						<SectionList
							sections={this.sections.map((section) => ({ ...section, data: section.data.slice() }))}
							renderSectionHeader={({ section }: { section: SectionListData<Section> }) => {
								return (
									<View style={{ padding: 5 }}>
										<Text style={{ fontSize: 18 }}>{section.title}</Text>
									</View>
								);
							}}
							renderItem={({ item }: { item: SectionItem }) => {
								return (
									<Observer>
										{() => (
											<Touchable
												onPress={() => (this.fetchSection(item.uri), (this.openDrawer = false))}
											>
												<View
													style={{
														padding: 5,
														backgroundColor: item.active ? BACK_WHITE : '#fff'
													}}
												>
													<Text style={{ fontSize: 14, marginLeft: 28 }}>{item.title}</Text>
												</View>
											</Touchable>
										)}
									</Observer>
								);
							}}
							keyExtractor={(item: SectionItem) => item.title}
							style={{ flex: 1 }}
						/>
					</View>
				}
			>
				<View style={styles.container}>
					<Toolbar
						leftElement={'arrow-back'}
						centerElement={this.title}
						onLeftElementPress={Router.pop}
						style={{ container: { backgroundColor: ICON_BLUE } }}
						rightElement={
							<Touchable onPress={() => (this.openDrawer = true)}>
								<Text style={{ fontSize: 20, fontWeight: 'bold', color: '#fff', marginRight: 8 }}>
									目录
								</Text>
							</Touchable>
						}
					/>
					<View style={{ flex: 1 }}>
						<WebView
							ref={(r) => (this.webview = r)}
							source={{ html: this.html, baseUrl: 'http://www.jfinal.com' }}
							on={this.onWebViewPostMsg}
							handler={this.webviewHandler}
							originWhitelist={[]}
						/>
					</View>
					<ActivityIndicator
						size={'large'}
						animating={this.loading}
						style={styles.loading}
						color={ICON_BLUE}
					/>
				</View>
			</Drawer>
		);
	}

	onWebViewPostMsg = async (payload: any) => {
		if (payload.action === 'openDoc') {
			this.fetchSection(payload.uri);
		} else if (payload.action === 'openUser') {
			if (this.props.store!.me && this.props.store!.me!.id === payload.id) {
				Modal.alert('跳转到我的主页？', '将无法返回此页', [
					{ text: '确认', onPress: () => Router.me() },
					{ text: '取消', onPress: () => null }
				]);
			} else Router.user(payload.id);
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

	webviewHandler = `function(msg){  
	}`;

	htmlBuild(head: string, content: string) {
		return `
		<!DOCTYPE html>
		<html> 
		<head>
			${head}
			<style> 
				p, li, span, div{
					font-size: 14px !important; 
				}
				body{
					background-color:#ffffff  !important;
					padding: 6px 6px 0;
				}
				.jf-panel-box {
					width: 100% !important;
					line-height: 1.5;
					font-size: 18px;
					padding: 0 10px 0 10px !important;
				}
				pre{
					overflow: auto;
				}
				pre li {
					white-space: nowrap; 
				}
				.jf-article{
					margin: 0 !important; 
					box-shadow: none !important;
					border: none !important;
					padding: 0 !important;
				}
				.jf-article-title{
					text-align:start; 
				}

			</style>
		</head>
		<body>
			${content}
			<script src="https://cdn.bootcss.com/zepto/1.2.0/zepto.min.js"></script> 
			<script type="text/javascript" src="/assets/prettify/prettify.js"></script>
			<script type="text/javascript"> 
				$(document).ready(function() {
					setTimeout(function(){
						$("pre").addClass("prettyprint linenums");
						prettyPrint();
					}, 100);

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

					[
						{name:"project", action:"openProject"}, 
						{name:"share", action:"openShare"}, 
						{name:"feedback", action:"openFeedback"},
						{name:"user", action:"openUser"},
						{name:"doc", action:"openDoc"},
					].forEach(function(item){
						if(item.name !== 'doc'){
							$('a[href^="' + "/" + item.name + '"]').each(function(){
								try{
									var elem = $(this); 
									regOne(this, "click", function(e){
										e.preventDefault(); 
										e.stopPropagation();  
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
								}catch(e){}
							});
							$("a").each(function(){
								try{
									var href = $(this).attr('href');
									var res = new RegExp('www\\.jfinal\\.com/'+item.name+'/\\\\d+').exec(href); 
									if(res){
										var id = Number.parseInt(res[0].match(/\\d+/)[0]); 
										regOne(this, "click", function(evt){
											evt.preventDefault(); 
											send({
												action: item.action, 
												id: id
											}); 
										})
									}
								}catch(e){}
							});
						}else{
							$("a").each(function(){
								try{
									var href = $(this).attr('href');
									var res = /((^(http:\\/\\/)?www.jfinal.com)|^)\\/doc.*$/.exec(href); 
									if(res){
										var uri = href.match(/\\/doc.*/)[0]; 
										regOne(this, "click", function(evt){
											evt.preventDefault(); 
											send({
												action: item.action, 
												uri: uri
											}); 
										})
									}
								}catch(e){}
							});
						}
					});	
				})
			</script>
		</body>
		</html>
		`;
	}

	fetchSection = async (uri: string) => {
		this.loading = true;
		const html = await GET_HTML(uri);
		const $ = cheerio.load(html);
		runInAction(() => {
			this.title = $('.doc-title').text().trim();
			const elems = $('.doc-menu-box >').toArray();
			this.sections.splice(0, this.sections.length);
			for (let i = 0; i < elems.length; i += 2) {
				const title = $(elems[i]).text().trim();
				const data = $(elems[i + 1]).find('li').toArray().map((li) => {
					const a = $(li).find('a');
					return {
						title: $(a).text().trim(),
						uri: $(a).attr('href'),
						active: uri === '/doc' ? $(li).attr('id') === '1_1' : $(a).attr('href') === uri
					};
				});
				this.sections.push(observable({ title, data }));
			}
			const head = $('head').html()!;
			const content = $('div.doc-content-box').html()!;
			this.html = this.htmlBuild(head, content);
			this.loading = false;
		});
	};

	closers: IReactionDisposer[] = [];

	componentDidMount() {
		(async () => {
			await this.fetchSection(this.props.uri || '/doc');
		})();
		this.closers.push(
			autorun(() => {
				if (this.openDrawer) {
					if (this.firstOpen) this.firstOpen = false;
					StatusBar.pushBackgroundColor('#fff');
					StatusBar.pushBarStyle('dark-content');
				} else if (!this.openDrawer && !this.firstOpen) {
					StatusBar.popBarStyle();
					StatusBar.popBackgroundColor();
				}
			})
		);
	}

	firstOpen = true;

	componentWillUnmount() {
		for (let closer of this.closers) {
			closer();
		}
	}
}

const styles = StyleSheet.create({
	sidebar: {
		flex: 1,
		backgroundColor: '#fff'
	} as ViewStyle,
	container: { flex: 1 } as ViewStyle,
	loading: {
		position: 'absolute',
		width: SCREEN_WIDTH,
		height: SCREEN_HEIGHT,
		justifyContent: 'center',
		alignItems: 'center'
	} as ViewStyle
});
