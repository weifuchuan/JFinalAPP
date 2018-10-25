import { action, observable, runInAction } from 'mobx';
import { inject, observer } from 'mobx-react/native';
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View, ViewStyle } from 'react-native';
import { retryDo } from '@/kit';
import { Store } from '@/store';
import { req } from '@/store/web';
import { BACK_WHITE, LOADING_BLUE } from '@/themes/color';
import { SCREEN_WIDTH } from '@/components/kit';
import _RefreshListView, { RefreshState, RefreshStateType } from '@/components/RefreshListView';
import Router from '@/router';
import ItemComp from './ItemComp';
import { Item, takeItems } from './kit';
import PageSelect from './PageSelect';

const RefreshListView = observer(_RefreshListView);

interface Props {
	store?: Store;
}

@inject('store')
@observer
export default class Project extends React.Component<Props> {
	@observable currPage: number = 1;
	@observable pageRange: [number, number] = [ 1, 1 ];
	@observable totalPageCount: number = 1;
	@observable projectItems: Item[] = [];
	@observable loading: boolean = false;
	@observable refreshState: RefreshStateType = RefreshState.Idle;
	pageToItems: Map<number, Item[]> = new Map();
	list: FlatList<Item> | null = null;

	render() {
		return (
			<View style={styles.container}>
				<RefreshListView
					data={this.projectItems.slice()}
					renderItem={({ item }) => {
						return (
							<ItemComp
								item={item}
								onPress={(item) => {
									Router.projectPage(item.id);
								}}
							/>
						);
					}}
					listRef={(r) => (this.list = r)}
					refreshState={this.refreshState}
					onHeaderRefresh={this.topRefresh}
					onFooterRefresh={this.bottomRefresh}
					keyExtractor={(item) => item.id.toString()}
					style={{ flex: 1 }}
					ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
					
				/>
				<ActivityIndicator size="small" color={LOADING_BLUE} style={styles.loading} animating={this.loading} />
				<PageSelect
					currPage={this.currPage}
					totalPage={this.totalPageCount}
					onCurrPageSelect={this.onCurrPageSelect}
				/>
			</View>
		);
	}

	@action // 下刷新
	private bottomRefresh = async (refreshState: RefreshStateType) => {
		if (refreshState === RefreshState.FooterRefreshing) {
			this.currPage = this.pageRange[1];
			// 当前页为最后一页
			if (this.currPage === this.totalPageCount) {
				this.refreshState = RefreshState.NoMoreData;
				return;
			}
			// 当前页非最后一页
			this.refreshState = refreshState;
			this.pageRange[1] = this.currPage + 1;
			// 下一页已缓存
			if (this.pageToItems.has(this.currPage + 1)) {
				this.projectItems.push(...this.pageToItems.get(this.currPage + 1)!);
				this.currPage += 1;
				this.refreshState = RefreshState.Idle;
				return;
			}
			// 获取下一页
			const html = await retryDo(async () => {
				const resp = await req.GET(`/project?p=${this.currPage + 1}`, null, {
					responseType: 'text'
				});
				return resp.data;
			}, 3);
			const result = takeItems(html);
			result.items = observable(result.items);
			runInAction(() => {
				this.currPage = result.currPage;
				this.totalPageCount = result.totalPage;
				this.projectItems.push(...result.items);
				this.refreshState = RefreshState.Idle;
			});
			// 缓存之
			this.pageToItems.set(result.currPage, result.items);
		}
	};

	@action // 上刷新
	private topRefresh = async (refreshState: RefreshStateType) => {
		if (refreshState === RefreshState.HeaderRefreshing) {
			this.currPage = this.pageRange[0];
			this.refreshState = refreshState;
			// 当前页为第一页，刷新所有数据，清除缓存
			if (this.currPage === 1) {
				this.pageRange[0] = this.pageRange[1] = 1;
				const html = await retryDo(async () => {
					const resp = await req.GET('/project', null, {
						responseType: 'text'
					});
					return resp.data;
				}, 3);
				const result = takeItems(html);
				runInAction(() => {
					this.currPage = result.currPage;
					this.totalPageCount = result.totalPage;
					this.projectItems.splice(0, this.projectItems.length);
					this.projectItems.push(...result.items);
					this.refreshState = RefreshState.Idle;
				});
				this.pageToItems.clear();
			} else {
				// 上一页已缓存
				this.pageRange[0] = this.currPage - 1;
				if (this.pageToItems.has(this.currPage - 1)) {
					this.projectItems.unshift(...this.pageToItems.get(this.currPage - 1)!);
					this.currPage -= 1;
					this.refreshState = RefreshState.Idle;
				} else {
					// 获取上一页
					const html = await retryDo(async () => {
						const resp = await req.GET(`/project?p=${this.currPage - 1}`, null, {
							responseType: 'text'
						});
						return resp.data;
					}, 3);
					const result = takeItems(html);
					result.items = observable(result.items);
					runInAction(() => {
						this.currPage = result.currPage;
						this.totalPageCount = result.totalPage;
						this.projectItems.unshift(...result.items);
						this.refreshState = RefreshState.Idle;
					});
					this.pageToItems.set(result.currPage, result.items);
				}
			}
		}
	};

	private onCurrPageSelect = async (currPage: number) => {
		this.loading = true;
		this.pageRange[0] = this.pageRange[1] = this.currPage = currPage;
		// 该页已缓存
		if (this.pageToItems.has(currPage)) {
			this.projectItems.splice(0, this.projectItems.length);
			this.projectItems.push(...this.pageToItems.get(currPage)!);
		} else {
			// 获取该页
			const html = await retryDo(async () => {
				const resp = await req.GET(`/project?p=${currPage}`, null, {
					responseType: 'text'
				});
				return resp.data;
			}, 3);
			const result = takeItems(html);
			result.items = observable(result.items);
			runInAction(() => {
				this.currPage = result.currPage;
				this.totalPageCount = result.totalPage;
				this.projectItems.splice(0, this.projectItems.length);
				this.projectItems.push(...result.items);
			});
			this.pageToItems.set(result.currPage, result.items);
		}
		this.list!.scrollToOffset({ animated: true, offset: 0 });
		this.loading = false;
	};

	componentDidMount() {
		const storage = this.props.store!.localStorage;
		try {
			(async () => {
				this.loading = true;
				try {
					let items = await storage.load<Item[]>({ key: 'projectItemsCache' });
					if (items) this.projectItems = observable(items);
				} catch (err) {}
				try {
					const html = await retryDo(async () => {
						const resp = await req.GET('/project', null, {
							responseType: 'text'
						});
						return resp.data;
					}, 3);
					const result = takeItems(html);
					result.items = observable(result.items);
					runInAction(() => {
						this.currPage = result.currPage;
						this.pageRange[0] = this.currPage;
						this.pageRange[1] = this.currPage;
						this.totalPageCount = result.totalPage;
						this.projectItems.splice(0, this.projectItems.length);
						this.projectItems.push(...result.items);
						this.loading = false;
					});
					this.pageToItems.set(result.currPage, result.items);
				} catch (err) {
					console.log(err);
					this.loading = false;
				}
			})();
		} catch (err) {
			console.log(err);
		}
		this.props.store!.onEditArticleOk(this.onEditArticleOk);
	}

	onEditArticleOk = (type: 'share' | 'feedback' | 'project') => {
		if (type === 'project') this.topRefresh(RefreshState.HeaderRefreshing);
	};

	componentWillUnmount() {
		this.props.store!.offEditArticleOk(this.onEditArticleOk);
		const storage = this.props.store!.localStorage;
		storage.save({
			key: 'projectItemsCache',
			data: this.projectItems.slice(0, 15)
		});
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: BACK_WHITE
	} as ViewStyle,
	loading: {
		position: 'absolute',
		top: SCREEN_WIDTH * 0.05,
		right: SCREEN_WIDTH * 0.05
	} as ViewStyle
});
