import { Modal, Toast } from 'antd-mobile-rn';
import { action, observable, runInAction } from 'mobx';
import { inject, observer } from 'mobx-react/native';
import React, { Component } from 'react';
import { FlatList, Image, Linking, Text, View, ViewStyle, TextStyle, TextInput, Keyboard } from 'react-native';
import { Button, Toolbar } from 'react-native-material-ui';
import { retryDo } from '../../kit';
import { Store } from '../../store';
import { req } from '../../store/web';
import { ICON_BLUE, BACK_WHITE } from '../base/color';
import { getNoCacheValue } from '../base/kit';
import RefreshListView, { RefreshState, RefreshStateType } from '../base/RefreshListView';
import HTML from '../base/RNRenderHTML';
import Touchable from '../base/Touchable';
import Router from '../Router';
import getPlatformElevation from '../base/getPlatformElevation';
import { Input } from 'react-native-elements';
const cheerio: CheerioAPI = require('react-native-cheerio');

interface Props {
	store?: Store;
	accountId: number;
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

	@observable msgContent = '';

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
							<Touchable onPress={() => null}>
								<View style={styles.msg}>
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
										<View style={styles.msg_1}>
											<Image
												source={{
													uri: `${req.baseUrl}${item.accountAvatar}?donotCache=${getNoCacheValue()}`
												}}
												style={{ width: 24, height: 24, marginRight: 6, borderRadius: 1.6 }}
											/>
											<Text>{item.accountNickName}</Text>
										</View>
									</Touchable>
									<View style={styles.msg_2}>
										<HTML
											html={item.content}
											onLinkPress={this.onLinkPress}
											containerStyle={{ marginTop: 5 }}
										/>
									</View>
									<View style={styles._1_3}>
										<Text style={styles._1_3_1}>{item.time}</Text>
										<Button
											text={'删除'}
											primary
											onPress={() => {
												Modal.alert('删除此条私信？', '删除后无法恢复。', [
													{
														text: '确认',
														onPress: async () => {
															const ret = (await req.GET(
																`/my/message/deleteByMessageId?messageId=${item.id}`
															)).data;
															if (ret.state == 'ok') {
																this.msgs.splice(index, 1);
															} else {
																Toast.fail(ret.msg);
															}
														}
													},
													{ text: '取消', onPress: () => {} }
												]);
											}}
											style={styles._1_3_2}
										/>
									</View>
								</View>
							</Touchable>
						);
					}}
					keyExtractor={(_, i) => i.toString()}
					refreshState={this.refreshState}
					onHeaderRefresh={this.onHeaderRefresh}
					onFooterRefresh={this.onFooterRefresh}
					style={{ flex: 1 }}
					listRef={(r) => (this.list = r)}
					keyboardShouldPersistTaps={'always'}
					ListEmptyComponent={() => (
						<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
							<Text>无</Text>
						</View>
					)}
					ListHeaderComponent={observer(() => (
						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								marginVertical: 5,
								padding: 5,
								backgroundColor: '#fff',
								...getPlatformElevation(2)
							}}
						>
							<TextInput
								value={this.msgContent}
								onChangeText={(t) => (this.msgContent = t)}
								multiline
								style={{
									flex: 1,
									borderColor: '#aaa',
									borderWidth: 1,
									borderRadius: 5,
									paddingVertical: 0,
									color: '#000'
								}}
							/>
							<Button text={'发送'} onPress={this.send} primary />
						</View>
					))}
				/>
			</View>
		);
	}

	send = async () => {
		if (this.msgContent.trim() === '') return;
		Keyboard.dismiss();
		try {
			const ret = (await req.POST_FORM('/my/message/send', {
				friendId: this.props.accountId,
				replyContent: this.msgContent
			})).data;
			if (ret.state === 'ok') {
				runInAction(() => {
					const $ = cheerio.load(`<div>${ret.replyItem}</div>`);
					this.msgs.unshift(this.parseItem($, $('li').toArray()[0]));
					this.msgContent = '';
				});
			} else {
				Toast.fail(ret.msg);
			}
		} catch (err) {
			Toast.fail('网络异常');
		}
	};

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
		this.nickName = $('div.jf-breadcrumb-box > ol > li.active > a').text();
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
			let msg = this.parseItem($, li);
			nfs.push(msg);
		});
		return nfs;
	};

	private parseItem($: CheerioStatic, li: CheerioElement): Msg {
		let id: number = Number.parseInt(
			$(li).find(`a[onclick^="deleteByMessageId"]`).attr('onclick').match(/\d+/)![0]
		);
		let accountId: number = Number.parseInt($(li).find('a.user-name').attr('href').match(/\d+/)![0]);
		let accountNickName: string = $(li).find('a.user-name').text();
		let accountAvatar: string = $(li).find('img.avatar').attr('src');
		let time: string = $(li).find('.jf-message-btn-box > span').text();
		let content: string = $(li).find('.text').html()!.trim();
		return { id, accountId, accountNickName, accountAvatar, time, content };
	}

	componentDidMount() {
		this.onHeaderRefresh(RefreshState.HeaderRefreshing);
	}
}

const styles = {
	container: {
		flex: 1,
		backgroundColor: BACK_WHITE
	} as ViewStyle,
	msg: {
		paddingTop: 5,
		paddingHorizontal: 8,
		backgroundColor: '#fff',
		...getPlatformElevation(2),
		marginVertical: 5
	} as ViewStyle,
	msg_1: {
		flexDirection: 'row',
		alignItems: 'center'
	} as ViewStyle,
	msg_2: {} as ViewStyle,
	_1_3: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: -7
	} as ViewStyle,
	_1_3_1: {} as TextStyle,
	_1_3_2: {
		container: {
			paddingHorizontal: 0
		}
	} as {
		container?: ViewStyle;
		text?: TextStyle;
	}
};

export default Message;
