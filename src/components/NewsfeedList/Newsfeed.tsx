import React from 'react';
import { View, ViewStyle, Image, Text, TextStyle, TouchableOpacity, ImageStyle, TextInput, Linking } from 'react-native';
import { observer, inject } from 'mobx-react/native';
import { Store } from '../../store';
import { NewsFeed } from '../../store/types';
import { Card, Button } from 'react-native-material-ui';
import { Button as Btn } from 'react-native-elements';
import { observable, toJS, autorun, IReactionDisposer, runInAction } from 'mobx';
import { baseUrl } from '../../store/req';
import HTML from '../base/RNRenderHTML';
import Touchable from '../base/Touchable';
import { req, saveNewsFeedReply } from '../../store/web';
import { Toast, Modal } from 'antd-mobile-rn';
import Router from '../Router';
import { getNoCacheValue } from '../base/kit';
const cheerio: CheerioAPI = require('react-native-cheerio');

interface Props {
	store?: Store;
	newsfeed: NewsFeed;
	hereAccountId?: number;
}

interface Reply {
	avatar: string;
	nickName: string;
	accountId: number;
	text: string;
}

@inject('store')
@observer
export default class Newsfeed extends React.Component<Props> {
	@observable openReplies = false;
	@observable replies: Reply[] = [];
	@observable replyContent = '';
	@observable repling = false;

	render() {
		const nf = this.props.newsfeed;
		return (
			<Card
				onPress={() => {
					if (nf.refType !== 'reply') {
						Router.push(`${nf.refType}Page`, { id: nf.refId });
					}
				}}
			>
				<View style={styles.container}>
					<View style={styles._1}>
						<Touchable
							onPress={() => {
								if (
									(!this.props.store!.me || this.props.store!.me!.id) !== nf.accountId &&
									this.props.hereAccountId !== nf.accountId
								)
									Router.user(nf.accountId);
							}}
						>
							<View style={styles._1_1}>
								<Image
									source={{ uri: `${baseUrl}${nf.accountAvatar}?donotCache=${getNoCacheValue()}` }}
									style={styles._1_1_1}
								/>
								<View style={styles._1_1_2}>
									<Text style={styles._1_1_2_nickname}>{nf.accountNickName}</Text>
								</View>
							</View>
						</Touchable>
						<View style={styles._1_2}>
							<View style={styles._1_2_1}>
								<HTML html={nf.content} onLinkPress={this.onLinkPress} />
							</View>
							{nf.refParentId && nf.refParentTitle && nf.refParentType ? (
								<Touchable
									onPress={() => {
										Router.push(`${nf.refParentType}Page`, { id: nf.refParentId });
									}}
								>
									<View style={styles._1_2_2}>
										<Image
											source={{
												uri: `${baseUrl}${nf.refParentAccountAvatar}?donotCache=${getNoCacheValue()}`
											}}
											style={styles._1_2_2_avatar}
										/>
										<Text style={styles._1_2_2_title} numberOfLines={1}>
											{nf.refParentTitle}
										</Text>
									</View>
								</Touchable>
							) : null}
						</View>
						<View style={styles._1_3}>
							<Text style={styles._1_3_1}>{nf.createAt}</Text>
							{nf.refType !== 'project' ? (
								<Button
									text={this.openReplies ? '关闭' : '回复'}
									primary
									onPress={() => {
										this.openReplies = !this.openReplies;
										this.replyContent = `@${nf.accountNickName} `;
									}}
									style={styles._1_3_2}
								/>
							) : null}
						</View>
					</View>
					{this.openReplies ? (
						<View style={styles._2}>
							<View style={styles._2_1}>
								<View style={{ borderColor: '#aaa', borderWidth: 1, borderRadius: 3, flex: 1 }}>
									<TextInput
										value={this.replyContent}
										onChangeText={(text) => (this.replyContent = text)}
										multiline
										style={{ flex: 1, padding: 0, textAlignVertical: 'center' }}
										underlineColorAndroid="transparent"
									/>
								</View>
								<Btn
									title={'发送'}
									onPress={this.onReply}
									loading={this.repling}
									raised
									containerStyle={{ marginLeft: 5 }}
								/>
							</View>
							{this.replies.map((reply, index) => {
								return (
									<View style={styles._2_reply} key={index.toString()}>
										<Touchable
											onPress={() => {
												if (
													this.props.store!.me &&
													this.props.store!.me!.id === reply.accountId
												) {
													Modal.alert('跳转到我的主页？', '将无法返回此页', [
														{ text: '确认', onPress: () => Router.me() },
														{ text: '取消', onPress: () => null }
													]);
												} else Router.user(reply.accountId);
											}}
										>
											<View style={styles._2_reply_1}>
												<Image
													source={{
														uri: `${req.baseUrl}${reply.avatar}?donotCache=${getNoCacheValue()}`
													}}
													style={{ width: 16, height: 16, marginRight: 6 }}
												/>
												<Text>{reply.nickName}</Text>
											</View>
										</Touchable>
										<View style={styles._2_reply_2}>
											<HTML html={reply.text} onLinkPress={this.onLinkPress} />
										</View>
									</View>
								);
							})}
						</View>
					) : null}
				</View>
			</Card>
		);
	}

	onReply = async () => {
		if (this.replyContent.trim() === '' || this.replyContent.trim() === `@${this.props.newsfeed.accountNickName}`) {
			Toast.info('请输入内容', 2);
			return;
		}
		this.repling = true;
		try {
			const ret = await saveNewsFeedReply(this.props.newsfeed.id, this.replyContent);
			if (ret.isOk) {
				const reply = observable(this.parseReplyItem(cheerio.load(ret.get('replyItem'))('li')));
				runInAction(() => {
					this.replies.unshift(reply);
					this.replyContent = `@${this.props.newsfeed.accountNickName} `;
					this.repling = false;
				});
				this.props.store!.emitMyReplyOk();
			} else {
				Toast.fail(ret.get('msg'), 2);
				this.repling = false;
			}
		} catch (e) {
			Toast.fail('网络异常');
			this.repling = false;
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

	closers = [] as IReactionDisposer[];

	componentDidMount() {
		this.closers.push(
			autorun(async () => {
				if (this.openReplies) {
					const resp = await req.POST_FORM(
						'/my/showReplyList',
						{ newsFeedId: this.props.newsfeed.id },
						{
							responseType: 'text'
						}
					);
					const html = resp.data as string;
					console.log(html);
					const $ = cheerio.load(html);
					runInAction(() => {
						this.replies.splice(0, this.replies.length);
						$('.newsfeed-reply-list > li').each((_, elem) => {
							try {
								const li = $(elem);
								let reply: Reply = this.parseReplyItem(li);
								this.replies.push(observable(reply));
							} catch (e) {}
						});
					});
				}
			})
		);
	}

	private parseReplyItem(li: Cheerio) {
		let reply: Reply = {
			avatar: '',
			nickName: '',
			accountId: 0,
			text: ''
		};
		reply.avatar = li.find('img.avatar').attr('src');
		reply.nickName = li.find('a.user-name').text().trim();
		const userHref = li.find('a.user-name').attr('href').trim();
		reply.accountId = Number.parseInt(userHref.substring(userHref.lastIndexOf('/') + 1));
		reply.text = li.find('div.text').html()!.trim();
		return reply;
	}

	componentWillUnmount() {
		for (let c of this.closers) {
			c();
		}
	}
}

const styles = {
	container: {
		flex: 1,
		padding: 5
	} as ViewStyle,
	// 起名 is so 烦
	_1: {} as ViewStyle,
	_1_1: {
		flexDirection: 'row',
		alignItems: 'center'
	} as ViewStyle,
	_1_1_1: {
		width: 32,
		height: 32
	} as ImageStyle,
	_1_1_2: {
		flex: 1,
		justifyContent: 'center',
		paddingLeft: 5,
		paddingTop: 5,
		paddingBottom: 5
	} as ViewStyle,
	_1_1_2_nickname: {
		fontSize: 20
	} as TextStyle,
	_1_2: {} as ViewStyle,
	_1_2_1: {
		flex: 1,
		marginTop: 5,
		marginBottom: 5
	} as ViewStyle,
	_1_2_2: {
		backgroundColor: '#eeeeee',
		flexDirection: 'row',
		alignItems: 'center',
		padding: 5
	} as ViewStyle,
	_1_2_2_avatar: {
		width: 24,
		height: 24
	} as ImageStyle,
	_1_2_2_title: {
		fontSize: 16,
		color: '#0044cc',
		flex: 1,
		marginLeft: 6
	} as TextStyle,
	_1_3: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: -5
	} as ViewStyle,
	_1_3_1: {} as TextStyle,
	_1_3_2: {
		container: {
			paddingHorizontal: 0
		}
	} as {
		container?: ViewStyle;
		text?: TextStyle;
	},
	_2: {
		borderTopColor: '#aaa',
		borderTopWidth: 1
	} as ViewStyle,
	_2_1: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 5
	} as ViewStyle,
	_2_reply: {
		paddingVertical: 5
	} as ViewStyle,
	_2_reply_1: {
		flexDirection: 'row',
		alignItems: 'center'
	} as ViewStyle,
	_2_reply_2: {} as ViewStyle
};
