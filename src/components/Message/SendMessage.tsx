import { Modal } from 'antd-mobile-rn';
import { action, observable, runInAction } from 'mobx';
import { inject, observer } from 'mobx-react/native';
import React, { Component } from 'react';
import { FlatList, Image, Linking, Text, TextInput, View, ViewStyle } from 'react-native';
import { Button, Toolbar } from 'react-native-material-ui';
import { retryDo } from '../../kit';
import { Store } from '../../store';
import { req } from '../../store/web';
import { ICON_BLUE } from '../base/color';
import { getNoCacheValue } from '../base/kit';
import RefreshListView, { RefreshState, RefreshStateType } from '../base/RefreshListView';
import HTML from '../base/RNRenderHTML';
import Touchable from '../base/Touchable';
import Router from '../Router';
const cheerio: CheerioAPI = require('react-native-cheerio');

interface Props {
	store?: Store;
	type: 'fans' | 'follow';
	accountId?: number;
}

interface Msg {
	id: number;
	accountId: number;
	accountNickName: string;
	accountAvatar: string;
	time: string;
	content: string;
}

@inject('store')
@observer
class Message extends Component<Props> {
	@observable nickName = '';

	@observable msgs: Msg[] = [];
	@observable refreshState: RefreshStateType = RefreshState.Idle;
	@observable currPage: number = 1;
	@observable totalPageCnt: number = 1;
	list: FlatList<Msg> | null = null;

	render() {
		return (
			<View style={styles.container}>
				<Toolbar
					leftElement={'arrow-back'}
					centerElement={`与 ${this.nickName} 的私信`}
					onLeftElementPress={() => Router.pop()}
					style={{ container: { backgroundColor: ICON_BLUE } }}
				/>
				<RefreshListView
					data={this.msgs.slice()}
					renderItem={({ item, index }) => {
						return (
							<View style={styles.reply} >
								<Touchable
									onPress={() => {
										if (this.props.store!.me && this.props.store!.me!.id === item.accountId) {
											Modal.alert('跳转到我的主页？', '将无法返回此页', [
												{ text: '确认', onPress: () => Router.me() },
												{ text: '取消', onPress: () => null }
											]);
										} else Router.user(item.accountId);
									}}
								>
									<View style={styles.reply_1}>
										<Image
											source={{
												uri: `${req.baseUrl}${item.accountAvatar}?donotCache=${getNoCacheValue()}`
											}}
											style={{ width: 16, height: 16, marginRight: 6 }}
										/>
										<Text>{item.accountNickName}</Text>
									</View>
								</Touchable>
								<View style={styles.reply_2}>
									<HTML html={item.content} onLinkPress={this.onLinkPress} />
								</View>

							</View>
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
					ListHeaderComponent={() => (
						<View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
							<TextInput />
							<Button text={'发送'} />
						</View>
					)}
				/>
			</View>
		);
	}

	onLinkPress = async (cls: any, href: string, attrs: { [name: string]: string }) => {
		if (href.includes('/user')) {
			const id = Number.parseInt(href.match(/\d+/)![0]);
			if (id !== this.props.store!.me!.id) {
				if (this.props.store!.me && this.props.store!.me!.id === id) {
					Modal.alert('跳转到我的主页？', '将无法返回此页', [
						{ text: '确认', onPress: () => Router.me() },
						{ text: '取消', onPress: () => null }
					]);
				} else Router.user(id);
			}
		} else {
			const res = href.match(/\/((project)|(newsfeed)|(share))\/\d+/);
			if (res) {
				const id = Number.parseInt(res[0].match(/\d+/)![0]);
				Router.push(`${res[0].match(/((project)|(newsfeed)|(share))/)![0]}Page`, { id });
			} else {
				Linking.openURL(href);
			}
		}
	};

	@action
	onHeaderRefresh = async (refreshState: RefreshStateType) => {
		if (refreshState === RefreshState.HeaderRefreshing) {
			this.refreshState = refreshState;
			this.msgs.splice(0, this.msgs.length);
			const html = await retryDo(async () => await req.GET_HTML(`/my/message/friend/${this.props.accountId}`), 3);
			const nfs = observable(this.parseHtml(html));
			runInAction(() => {
				this.msgs.push(...nfs);
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
			const html = await retryDo(
				async () => await req.GET_HTML(`/my/message/friend/${this.props.accountId}?p=${this.currPage + 1}`),
				3
			);
			const nfs = observable(this.parseHtml(html));
			runInAction(() => {
				this.msgs.push(...nfs);
				this.refreshState = RefreshState.Idle;
			});
		}
	};

	@action
	private parseHtml = (html: string): Msg[] => {
		const $ = cheerio.load(html);
		const paginate = $('.jf-paginate');
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
		const nfs: Msg[] = [];
		$('.newsfeed-reply-list > li').each((i, li) => {
			if (i === 0) return;
			let id: number = Number.parseInt(
				$(li).find(`a[onclick^="deleteByMessageId"]`).attr('onclick').match(/\d+/)![0]
			);
			let accountId: number = Number.parseInt($(li).find('a.user-name').attr('href').match(/\d+/)![0]);
			let accountNickName: string = $(li).find('a.user-name').text();
			let accountAvatar: string = $(li).find('img.avatar').attr('src');
			let time: string = $(li).find('.jf-message-btn-box > span').text();
			let content: string = $(li).find('.text').html()!;
			nfs.push({ id, accountId, accountNickName, accountAvatar, time, content });
		});
		return nfs;
	};

	componentDidMount() {
		this.onHeaderRefresh(RefreshState.HeaderRefreshing);
	}
}

const styles = {
	container: {
		flex: 1, 
	} as ViewStyle, 
	reply: {
		paddingVertical: 5
	} as ViewStyle,
	reply_1: {
		flexDirection: 'row',
		alignItems: 'center'
	} as ViewStyle,
	reply_2: {} as ViewStyle
};

export default Message;
