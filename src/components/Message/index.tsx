import React, { Component } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { Store } from '../../store';
import Router from '../Router';
import { ICON_BLUE } from '../base/color';
import { inject, observer } from 'mobx-react/native';
import { Toolbar } from 'react-native-material-ui';
import WebView from '../base/WebView';
import { req } from '../../store/web';
import { observable, runInAction, action } from 'mobx';
import { Modal, Toast } from 'antd-mobile-rn';
import { NewsFeed } from '../../store/types';
import RefreshListView, { RefreshStateType, RefreshState } from '../base/RefreshListView';
import MessageItem from './MessageItem';
import { retryDo } from '../../kit';
const cheerio: CheerioAPI = require('react-native-cheerio');

interface Props {
	store?: Store;
	type: 'fans' | 'follow';
	accountId?: number;
}

@inject('store')
@observer
class Message extends Component<Props> { 
	@observable newsfeeds: NewsFeed[] = [];
	@observable refreshState: RefreshStateType = RefreshState.Idle;
	@observable currPage: number = 1;
	@observable totalPageCnt: number = 1;
	list: FlatList<NewsFeed> | null = null;

	render() {
		return (
			<View style={styles.container}>
				<Toolbar
					leftElement={'arrow-back'}
					centerElement={"我的私信"}
					onLeftElementPress={() => Router.pop()}
					style={{ container: { backgroundColor: ICON_BLUE } }}
				/>
				<RefreshListView
					data={this.newsfeeds.slice()}
					renderItem={({ item, index }) => {
						return (
							<MessageItem
								newsfeed={item}
								onDelete={() => {
									Modal.alert(`删除确认`, `即将删除与"${item.accountNickName}"的所有私信，确定要删除？`, [
										{
											text: '确认',
											onPress: async () => {
												const ret = (await req.GET(
													`/my/message/deleteByFriendId?friendId=${item.accountId}`
												)).data;
												if (ret.state == 'ok') {
													this.newsfeeds.splice(index, 1);
												} else {
													Toast.fail(ret.msg);
												}
											}
										},
										{ text: '取消', onPress: () => {} }
									]);
								}}
								onSendMessage={() => {
									Router.sendMessage(item.accountId);
								}}
							/>
						);
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
				/>
			</View>
		);
	}

	@action
	onHeaderRefresh = async (refreshState: RefreshStateType) => {
		if (refreshState === RefreshState.HeaderRefreshing) {
			this.refreshState = refreshState;
			this.newsfeeds.splice(0, this.newsfeeds.length);
			const html = await retryDo(async () => await req.GET_HTML(`/my/message`), 3);
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
			const html = await retryDo(async () => await req.GET_HTML(`/my/message?p=${this.currPage + 1}`), 3);
			const nfs = observable(this.parseHtml(html));
			runInAction(() => {
				this.newsfeeds.push(...nfs);
				this.refreshState = RefreshState.Idle;
			});
		}
	};

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
			let content = $(li).find('.newsfeed-text').html()!.trim();
			let refType: 'message' = 'message';
			const onclick = $(li).find('.reply').attr('onclick');
			const id = Number.parseInt(onclick ? onclick.match(/\d+/)![0] : '0');
			let refId = accountId;
			const messageCount = Number.parseInt(
				$(li).find('div.newsfeed-item > div.newsfeed-icon > a:nth-child(2)').text().match(/\d+/)![0]
			);
			nfs.push({
				id,
				accountId,
				accountNickName,
				accountAvatar,
				content,
				refType,
				refId,
				createAt,
				replies: [],
				messageCount
			});
		});
		return nfs;
	};

	componentDidMount() {
		this.onHeaderRefresh(RefreshState.HeaderRefreshing);
	}
}

// define your styles
const styles = StyleSheet.create({
	container: {
		flex: 1
	}
});

//make this component available to the app
export default Message;
