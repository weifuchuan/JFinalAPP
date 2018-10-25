import React from 'react';
import { action, observable, runInAction, autorun, IReactionDisposer, toJS } from 'mobx';
import { inject, observer } from 'mobx-react/native';
import { View, ViewStyle, FlatList, Text } from 'react-native';
import { retryDo } from '@/kit';
import { Store } from '@/store';
import { NewsFeed } from '@/store/types';
import { req } from '@/store/web';
import RefreshListView, { RefreshState, RefreshStateType } from '@/components/RefreshListView';
import Newsfeed from './Newsfeed';
const cheerio: CheerioAPI = require('react-native-cheerio');

interface Props {
	store?: Store;
	uri: string;
	style?: ViewStyle;
	shouldCache?: boolean;
}

type Uri = string;
const cache = new Map<Uri, NewsFeed[]>();

@inject('store')
@observer
export default class NewsfeedList extends React.Component<Props> {
	@observable newsfeeds: NewsFeed[] = [];
	@observable refreshState: RefreshStateType = RefreshState.Idle;
	@observable currPage: number = 1;
	@observable totalPageCnt: number = 1;
	list: FlatList<NewsFeed> | null = null;

	render() {
		let hereAccountId: number | undefined;
		if (this.props.uri.startsWith('/user')) {
			hereAccountId = Number.parseInt(this.props.uri.match(/\d+/)![0]);
		}
		return (
			<View style={this.props.style}>
				<RefreshListView
					data={this.newsfeeds.slice()}
					renderItem={({ item }) => {
						return <Newsfeed newsfeed={item} hereAccountId={hereAccountId} />;
					}}
					keyExtractor={(_, i) => i.toString()}
					refreshState={this.refreshState}
					onHeaderRefresh={this.onHeaderRefresh}
					onFooterRefresh={this.onFooterRefresh}
					style={{ flex: 1 }}
					listRef={(r) => (this.list = r)}
					ListEmptyComponent={() => (
						<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
							<Text>无</Text>
						</View>
					)}
					ListHeaderComponent={() => <View style={{ height: 10 }} />}
					ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
					keyboardShouldPersistTaps={'always'}
				/>
			</View>
		);
	}

	@action
	onHeaderRefresh = async (refreshState: RefreshStateType) => {
		if (refreshState === RefreshState.HeaderRefreshing) {
			this.refreshState = refreshState;
			this.newsfeeds.splice(0, this.newsfeeds.length);
			const html = await retryDo(async () => await req.GET_HTML(`${this.props.uri}`), 3);
			const nfs = observable(this.parseHtml(html));
			runInAction(() => {
				this.newsfeeds.push(...nfs);
				this.refreshState = RefreshState.Idle;
			});
		}
	};

	@action
	onFooterRefresh = async (refreshState: RefreshStateType) => {
		if (refreshState === RefreshState.FooterRefreshing) {
			this.refreshState = refreshState;
			if (this.currPage === this.totalPageCnt) {
				this.refreshState = RefreshState.NoMoreData;
				return;
			}
			const html = await retryDo(async () => await req.GET_HTML(`${this.props.uri}?p=${this.currPage + 1}`), 3);
			const nfs = observable(this.parseHtml(html));
			runInAction(() => {
				this.newsfeeds.push(...nfs);
				this.refreshState = RefreshState.Idle;
			});
		}
	};

	private closers: IReactionDisposer[] = [];

	componentDidMount() {
		(async () => {
			if (this.props.uri.startsWith('/my')) {
				if (this.props.store!.me) {
					if (this.props.shouldCache && cache.has(this.props.uri)) {
						this.newsfeeds = observable(cache.get(this.props.uri)!);
					} else {
						await this.onHeaderRefresh(RefreshState.HeaderRefreshing);
					}
				} else {
					this.newsfeeds.splice(0, this.newsfeeds.length);
				}
			} else {
				if (this.props.shouldCache && cache.has(this.props.uri)) {
					this.newsfeeds = observable(cache.get(this.props.uri)!);
				} else {
					await this.onHeaderRefresh(RefreshState.HeaderRefreshing);
				}
			}
		})();
		if (this.props.uri.startsWith('/my')) {
			this.props.store!.onLogged(this.refresh);
			this.props.store!.onLogout(this.refresh);
			if (this.props.uri.startsWith('/my/referMe')) {
				this.props.store!.onToReferMe(this.refresh);
			}
		}
	}

	refresh = () => {
		this.onHeaderRefresh(RefreshState.HeaderRefreshing);
	};

	cache = () => {
		if (this.props.shouldCache) cache.set(this.props.uri, toJS(this.newsfeeds));
	};

	componentWillUnmount() {
		for (const c of this.closers) c();
		this.cache();
		if (this.props.uri.startsWith('/my')) {
			this.props.store!.offLogged(this.refresh);
			this.props.store!.offLogout(this.refresh);
			if (this.props.uri.startsWith('/my/referMe')) this.props.store!.offToReferMe(this.refresh);
		}
	}

	@action
	private parseHtml = (html: string): NewsFeed[] => {
		const $ = cheerio.load(html);
		const newsfeedListBox = $('.newsfeed-list-box');
		const paginate = newsfeedListBox.find('.jf-paginate');
		if (paginate.length > 0) {
			const ps = paginate.find('a').toArray().map((elem) => $(elem).text().trim());
			if (ps.length > 0) {
				if (/^\d+$/.test(ps[ps.length - 1])) {
					this.totalPageCnt = Number.parseInt(ps[ps.length - 1]);
				} else {
					this.totalPageCnt = Number.parseInt(ps[ps.length - 2]);
				}
			}
			this.currPage = Number.parseInt(paginate.find('.current-page').text().trim());
		} else {
			this.totalPageCnt = this.currPage = 1;
		}
		const nfs: NewsFeed[] = [];
		newsfeedListBox.find('.newsfeed-list > li').each((_, li) => {
			const userHref = $(li).find('.newsfeed-user-name > a').attr('href');
			const accountId = Number.parseInt(userHref.substring(userHref.lastIndexOf('/') + 1));
			const accountNickName = $(li).find('.newsfeed-user-name > a').text().trim();
			const accountAvatar = $(li).find('.newsfeed-user-img img').attr('src');
			const createAt = $(li).find('.newsfeed-time').text().trim();
			let content = '';
			let refType: 'project' | 'share' | 'feedback' | 'reply' = 'reply';
			const onclick = $(li).find('.reply').attr('onclick');
			const id = Number.parseInt(onclick ? onclick.match(/\d+/)![0] : '0');
			let refId = 0;
			// ref parent
			let refParentType: 'project' | 'share' | 'feedback' | undefined;
			let refParentId: number | undefined;
			let refParentTitle: string | undefined;
			let refParentAccountId: number | undefined;
			let refParentAccountAvatar: string | undefined;
			if ($(li).find('.newsfeed-text').length > 0) {
				content = $(li).find('.newsfeed-text').html()!.trim();
				const newsfeedRefParent = $(li).find('.newsfeed-ref-parent');
				const userHref = newsfeedRefParent.find('.newsfeed-ref-parent-image > a').attr('href');
				refParentAccountId = Number.parseInt(userHref.substring(userHref.lastIndexOf('/') + 1));
				refParentAccountAvatar = newsfeedRefParent.find('.newsfeed-ref-parent-image img').attr('src');
				const newsRefParentTitle = $(li).find('.news-ref-parent-title a');
				refParentTitle = newsRefParentTitle.text().trim();
				const parentHref = newsRefParentTitle.attr('href');
				refParentType = parentHref.substring(parentHref.indexOf('/') + 1, parentHref.lastIndexOf('/')) as any;
				refParentId = Number.parseInt(parentHref.substring(parentHref.lastIndexOf('/') + 1));
			} else {
				content = $(li).find('.newsfeed-ref a').html()!.trim();
				const refHref = $(li).find('.newsfeed-ref a').attr('href');
				refType = refHref.substring(refHref.indexOf('/') + 1, refHref.lastIndexOf('/')) as any;
				refId = Number.parseInt(refHref.substring(refHref.lastIndexOf('/') + 1).trim());
			}
			nfs.push({
				id,
				accountId,
				accountNickName,
				accountAvatar,
				content,
				refType,
				refId,
				refParentType,
				refParentId,
				refParentTitle,
				refParentAccountId,
				refParentAccountAvatar,
				createAt,
				replies: []
			});
		});
		return nfs;
	};
}

let counter = 0;
