import { Modal, SwipeAction, Toast } from 'antd-mobile-rn';
import { observable, runInAction } from 'mobx';
import { inject, observer } from 'mobx-react/native';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Toolbar } from 'react-native-material-ui';
import { Store } from '../../store';
import { req } from '../../store/web';
import { ICON_BLUE } from '../base/color';
import RefreshListView, { RefreshState, RefreshStateType } from '../base/RefreshListView';
import Touchable from '../base/Touchable';
import Router from '../Router';
const cheerio: CheerioAPI = require('react-native-cheerio');

interface Props {
	store?: Store;
}

interface FavoriteItem {
	type: 'feedback' | 'project' | 'share';
	title: string;
	id: number;
	operations: {
		name: string;
		handler: () => void;
	}[];
}

@inject('store')
@observer
export default class MyFavorite extends React.Component<Props> {
	@observable articles: FavoriteItem[] = [];
	@observable refreshState: RefreshStateType = RefreshState.Idle;

	render() {
		return (
			<View style={styles.container}>
				<Toolbar
					leftElement={'arrow-back'}
					centerElement={'我的收藏'}
					onLeftElementPress={() => Router.pop()}
					style={{ container: { backgroundColor: ICON_BLUE } }}
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
										Router.push(`${item.type}Page`, { id: item.id });
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
							<Text>未收藏文章</Text>
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
		const html = await req.GET_HTML('/my/favorite');
		const $ = cheerio.load(html);
		runInAction(() => {
			this.articles.splice(0, this.articles.length);
			$('.jf-my-article-list > li').each((i, e) => {
				const title = $(e).find('.jf-my-article-title > a').text().trim();
				const href = $(e).find('.jf-my-article-title > a').attr('href');
				const id = Number.parseInt(href.substring(href.lastIndexOf('/') + 1));
				const type: any = href.substring(href.indexOf('/') + 1, href.lastIndexOf('/'));
				const item: FavoriteItem = observable({ title, id, operations: [], type });
				item.operations.push({
					name: '删除',
					handler: () => {
						Modal.alert('确认删除？', '删除后无法恢复', [
							{
								text: '确认',
								onPress: async () => {
									try {
										await req.GET(`/my/favorite/delete?id=${id}`);
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
				this.articles.push(item);
			});
			this.refreshState = RefreshState.Idle;
		});
	};

	componentDidMount() {
		this.fetchArticles();
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
