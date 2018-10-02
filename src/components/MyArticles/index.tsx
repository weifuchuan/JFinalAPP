import React from 'react';
import { inject, observer } from 'mobx-react/native';
import { View, StyleSheet, ViewStyle, FlatList, Text } from 'react-native';
import { BACK_WHITE, ICON_BLUE } from '../base/color';
import { Toolbar, Button } from 'react-native-material-ui';
import Router from '../Router';
import { Store } from '../../store';
import { req } from '../../store/web';
import { observable, runInAction } from 'mobx';
import { Modal, Toast, SwipeAction } from 'antd-mobile-rn';
import Touchable from '../base/Touchable';
import RefreshListView, { RefreshState } from '../base/RefreshListView';
import { RefreshStateType } from '../base/RefreshListView';
const cheerio: CheerioAPI = require('react-native-cheerio');

interface Props {
	store?: Store;
	type: 'feedback' | 'project' | 'share';
	accountId?: number;
}

interface ArticleItem {
	title: string;
	id: number;
	operations: {
		name: string;
		handler: () => void;
	}[];
}

@inject('store')
@observer
export default class MyArticles extends React.Component<Props> {
	@observable articles: ArticleItem[] = [];
	@observable accountNickname = '我';
	@observable refreshState: RefreshStateType = RefreshState.Idle;

	render() {
		let title = this.props.type === 'share' ? '分享' : this.props.type === 'feedback' ? '反馈' : '项目';
		return (
			<View style={styles.container}>
				<Toolbar
					leftElement={'arrow-back'}
					centerElement={this.accountNickname + '的' + title}
					onLeftElementPress={() => Router.pop()}
					style={{ container: { backgroundColor: ICON_BLUE } }}
					rightElement={
						this.props.accountId ? <View/> : (
							<Button
								text={`创建${title}`}
								style={{ text: { color: '#fff' } }}
								onPress={() => {
									Router.editArticle(this.props.type);
								}}
							/>
						)
					}
				/>
				<RefreshListView
					refreshState={this.refreshState}
					onHeaderRefresh={this.onHeaderRefresh}
					data={this.articles.slice()}
					renderItem={({ item }) => {
						return (
							<SwipeAction
								autoClose
								right={item.operations.map((v) => ({ text: v.name, onPress: v.handler }))}
							>
								<Touchable
									onPress={() => {
										Router.push(`${this.props.type}Page`, { id: item.id });
									}}
								>
									<View style={styles.item}>
										<Text style={{ fontSize: 20, color: '#000' }}>{item.title}</Text>
									</View>
								</Touchable>
							</SwipeAction>
						);
					}}
					keyExtractor={(item) => item.id.toString()}
					style={{ flex: 1 }}
					ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#ddd' }} />}
					ListHeaderComponent={() => <View style={{ height: 5, backgroundColor: '#fff' }} />}
					ListFooterComponent={() => <View style={{ height: 5, backgroundColor: '#fff' }} />}
					ListEmptyComponent={() => (
						<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
							<Text>无</Text>
						</View>
					)}
				/>
			</View>
		);
	}

	onHeaderRefresh = (refreshState: RefreshStateType) => {
		if (refreshState === RefreshState.HeaderRefreshing) {
			this.fetchArticles();
		}
	};

	private readonly fetchArticles = async () => {
		this.refreshState = RefreshState.HeaderRefreshing;
		let uri = this.props.accountId ? `/user/${this.props.type}/${this.props.accountId}` : `/my/${this.props.type}`;
		const html = await req.GET_HTML(uri);
		const $ = cheerio.load(html);
		runInAction(() => {
			this.articles.splice(0, this.articles.length);
			$('.jf-my-article-list > li').each((i, e) => {
				const title = $(e).find('.jf-my-article-title > a').text().trim();
				const href = $(e).find('.jf-my-article-title > a').attr('href');
				const id = Number.parseInt(href.substring(href.lastIndexOf('/') + 1));
				const item: ArticleItem = observable({ title, id, operations: [] });
				if (this.props.accountId) {
					this.accountNickname = $('.nick-name').text().trim();
				} else {
					item.operations.push({
						name: '编辑',
						handler: () => {
							Router.editArticle(this.props.type, true, id);
						}
					});
					item.operations.push({
						name: '删除',
						handler: () => {
							Modal.alert('确认删除？', '删除后无法恢复', [
								{
									text: '确认',
									onPress: async () => {
										try {
											await req.GET(`/my/${this.props.type}/delete?id=${id}`);
											const i = this.articles.findIndex((v) => v === item);
											if (i !== -1) this.articles.splice(i, 1);
										} catch (e) {
											Toast.fail('网络异常');
										}
									}
								},
								{
									text: '取消',
									onPress: async () => {}
								}
							]);
						}
					});
				}
				this.articles.push(item);
			});
			this.refreshState = RefreshState.Idle;
		});
	};

	componentDidMount() {
		this.fetchArticles();
		this.props.store!.onEditArticleOk( this.onEditArticleOk);
	}

	onEditArticleOk = (type: 'share' | 'feedback' | 'project') => {
		if (this.props.store!.me && type === this.props.type) this.onHeaderRefresh(RefreshState.HeaderRefreshing);
	};

	componentWillUnmount() {
		this.props.store!.offEditArticleOk( this.onEditArticleOk);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff'
	} as ViewStyle,
	item: {
		justifyContent: 'center',
		paddingHorizontal: 10,
		paddingVertical: 10,
		backgroundColor: '#fff'
	} as ViewStyle
});
