import { Modal } from 'antd-mobile-rn';
import { IReactionDisposer } from 'mobx';
import { inject, observer } from 'mobx-react/native';
import React from 'react';
import { Image, ImageStyle, Linking, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Button, Card } from 'react-native-material-ui';
import { Store } from '../../store';
import { baseUrl } from '../../store/req';
import { NewsFeed } from '../../store/types';
import { getNoCacheValue } from '../base/kit';
import HTML from '../base/RNRenderHTML';
import Touchable from '../base/Touchable';
import Router from '../Router';
const cheerio: CheerioAPI = require('react-native-cheerio');

interface Props {
	store?: Store;
	newsfeed: NewsFeed;
	hereAccountId?: number;
	onDelete: () => void;
	onSendMessage: () => void;
}

@inject('store')
@observer
export default class MessageItem extends React.Component<Props> {
	render() {
		const nf = this.props.newsfeed;
		return (
			<Card>
				<View style={styles.container}>
					<View style={styles._1}>
						<Touchable
							onPress={() => {
								if (this.props.store!.me!.id !== nf.accountId) Router.user(nf.accountId);
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
						</View>
						<View style={styles._1_3}>
							<Text style={styles._1_3_1}>{nf.createAt}</Text>
							<View style={styles._1_3_2}>
								<Button text={'删除'} primary onPress={this.props.onDelete} style={styles._1_3_2_btn} />
								<Button
									text={'发送私信'}
									primary
									onPress={this.props.onSendMessage}
									style={styles._1_3_2_btn}
								/>
								<Button
									text={`查看私信(${this.props.newsfeed.messageCount})`}
									primary
									onPress={this.props.onSendMessage}
									style={styles._1_3_2_btn}
								/>
							</View>
						</View>
					</View>
				</View>
			</Card>
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

	closers = [] as IReactionDisposer[];

	componentDidMount() {}

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
		flexDirection: 'row'
	} as ViewStyle,
	_1_3_2_btn: {
		container: {
			paddingHorizontal: 0,
			marginLeft: 10
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
declare var global: any;
global.cheerio = cheerio;
