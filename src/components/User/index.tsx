import { Drawer, Toast } from 'antd-mobile-rn';
import { autorun, IReactionDisposer, observable, runInAction } from 'mobx';
import { inject, observer } from 'mobx-react/native';
import React from 'react';
import { Alert, Image, ImageStyle, ScrollView, Text, View, ViewStyle } from 'react-native';
import { Button, Toolbar, ToolbarStyle } from 'react-native-material-ui';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { retryDo } from '../../kit';
import { Store } from '../../store';
import { req } from '../../store/web';
import { AccountInPage } from '../../types';
import { BACK_WHITE, ICON_BLUE } from '../base/color';
import { SCREEN_WIDTH } from '../base/kit';
import StatusBar from '../base/StatusBar';
import Touchable from '../base/Touchable';
import NewsfeedList from '../NewsfeedList';
import Router from '../Router'; 
const cheerio: CheerioAPI = require('react-native-cheerio');

interface Props {
	store?: Store;
	id: number;
}

@inject('store')
@observer
export default class Me extends React.Component<Props> {
	@observable openDrawer = false;
	@observable followCnt = 0;
	@observable fansCnt = 0;
	@observable likeCnt = 0;
	@observable
	account: AccountInPage & { relation: '未关注' | '已关注' | '粉丝' | '互相关注' } = {
		id: 0,
		nickName: '',
		avatar: '',
		relation: '未关注'
	};

	constructor(props: Props) {
		super(props);
		this.account.id = this.props.id;
	}

	private readonly drawerItems = [
		{
			text: (self: any) => `关注(${self.followCnt})`,
			type: 'follow'
		},
		{
			text: (self: any) => `粉丝(${self.fansCnt})`,
			type: 'fans'
		},
		{
			text: (self: any) => `赞(${self.likeCnt})`,
			type: 'like'
		},
		{
			text: () => '分享',
			type: 'share'
		},
		{
			text: () => '反馈',
			type: 'feedback'
		},
		{
			text: () => '项目',
			type: 'project'
		},
		{
			text: () => '发私信',
			type: 'message'
		}
	];

	render() {
		return (
			<View style={styles.container}>
				<Drawer
					position="left"
					open={this.openDrawer}
					onOpenChange={(isOpen) => (this.openDrawer = isOpen)}
					drawerWidth={260}
					sidebar={
						<View style={styles.sidebar}>
							<View style={styles.drawerAccountView}>
								<View style={styles.drawerAvatorView}>
									<Image
										source={{
											uri: `${req.baseUrl}${this.account.avatar}`
										}}
										style={styles.drawerAvatarImage}
									/>
								</View>
								<View style={styles.drawerAccout}>
									<View style={{ justifyContent: 'space-evenly' }}>
										<Text style={{ fontSize: 18 }}>{this.account.nickName}</Text>
										<Text style={{ fontSize: 16 }}>{this.account.relation}</Text>
									</View>
									<View>
										<Button
											text={
												this.account.relation === '未关注' || this.account.relation === '粉丝' ? (
													'关注'
												) : (
													'取消'
												)
											}
											onPress={this.handleFriend}
											style={{
												container: { paddingHorizontal: 0 },
												text: { color: 'rgb(72,72,72)', fontWeight: 'normal' }
											}}
										/>
									</View>
								</View>
							</View>
							<ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
								<View style={{ width: 260 }}>
									{this.drawerItems.map((item) => {
										return (
											<Touchable
												onPress={() => {
													this.onDrawerItemPress(item);
												}}
												key={item.type}
											>
												<View style={styles.drawerItem}>
													<Text style={{ fontSize: 18 }}>{item.text(this)}</Text>
													<MaterialIcons name={'chevron-right'} size={26} />
												</View>
											</Touchable>
										);
									})}
								</View>
							</ScrollView>
						</View>
					}
				>
					<View style={{ flex: 1 }}>
						<Toolbar
							leftElement={'arrow-back'}
							onLeftElementPress={() => Router.pop()}
							rightElement={
								<Touchable onPress={() => (this.openDrawer = true)}>
									<Image
										source={{ uri: `${req.baseUrl}${this.account.avatar}` }}
										style={styles.toolbarLeftAvatar}
									/>
								</Touchable>
							}
							centerElement={this.account.nickName}
							style={styles.toolbarStyle}
						/>
						<View style={styles.innerContainer}>
							<NewsfeedList uri={`/user/${this.props.id}`} style={{ flex: 1 }} />
						</View>
					</View>
				</Drawer>
			</View>
		);
	}

	handleFriend = async () => {
		const isAdd = this.account.relation === '粉丝' || this.account.relation === '未关注';
		const url = isAdd ? '/friend/add?friendId=' + this.account.id : '/friend/delete?friendId=' + this.account.id;
		const ret = (await req.GET(url)).data;
		if (ret.state === 'ok') {
			/**
			 * 查询 accountId 与 friendId 之间的关系，返回值为 -1、1、2、3、4 表达的含义分别为：
			 * -1：accountId 与 friendId 值相同
			 * 0： accountId 与 friendId 无任何关系
			 * 1： accountId 关注了 friendId
			 * 2： friendId 关注了 accountId
			 * 3： accountId 与 friendId 互相关注
			 */
			switch (ret.friendRelation) {
				case 0:
					this.account.relation = '未关注';
					break;
				case 1:
					this.account.relation = '已关注';
					break;
				case 2:
					this.account.relation = '粉丝';
					break;
				case 3:
					this.account.relation = '互相关注';
					break;
				default:
					break;
			}
		} else {
			Toast.fail(ret.msg, 2);
		}
	};

	private onDrawerItemPress(item: { text: (...params: any[]) => string; type: string }) {
		switch (item.type) {
			case 'follow':
				Router.friends('follow', this.props.id);
				break;
			case 'fans':
				Router.friends('fans', this.props.id);
				break;
			case 'like':
				break;
			case 'share':
				Router.myArticles('share', this.props.id);
				break;
			case 'feedback':
				Router.myArticles('feedback', this.props.id);
				break;
			case 'project':
				Router.myArticles('project', this.props.id);
				break;
			case 'message':
				if (this.props.store!.me) Router.sendMessage(this.props.id);
				else Router.login();
				break;
		}
		this.openDrawer = false;
	}

	closers: IReactionDisposer[] = [];
	componentDidMount() {
		(async () => {
			try {
				const html = await retryDo(async () => {
					return await req.GET_HTML(`/user/${this.props.id}`);
				}, 3);
				const $ = cheerio.load(html);
				runInAction(() => {
					this.account.id = this.props.id;
					this.account.avatar = $('div.user-info.clearfix > a > img').attr('src');
					this.account.nickName = $('span.nick-name').text();
					this.account.relation = $('span.operation').text().trim() as any;
					if (this.account.relation.startsWith('未关注')) {
						this.account.relation = '未关注';
					} else if (this.account.relation.startsWith('已关注')) {
						this.account.relation = '已关注';
					} else if (this.account.relation.startsWith('粉丝')) {
						this.account.relation = '粉丝';
					} else {
						this.account.relation = '互相关注';
					}
					const userFriendNums = $('.user-friend-num > a').toArray();
					this.followCnt = Number.parseInt($(userFriendNums[0]).text().match(/\d+/)![0]);
					this.fansCnt = Number.parseInt($(userFriendNums[1]).text().match(/\d+/)![0]);
					this.likeCnt = Number.parseInt($(userFriendNums[2]).text().match(/\d+/)![0]);
				});
			} catch (e) {
				Alert.alert('网络请求错误', e.toString(), [ { text: 'OK', onPress: () => Router.pop() } ], {
					cancelable: false
				});
			}
		})();

		this.closers.push(
			autorun(() => {
				if (this.openDrawer) {
					if (this.firstOpen) this.firstOpen = false;
					StatusBar.pushBackgroundColor('rgb(158,158,158)');
					StatusBar.pushBarStyle('light-content');
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

const styles = {
	container: {
		flex: 1,
		backgroundColor: BACK_WHITE
	} as ViewStyle,
	toolbarLeftAvatar: {
		width: 40,
		height: 40,
		borderRadius: 5,
		borderColor: '#fff',
		borderWidth: 1.5
	} as ImageStyle,
	unloggedContainer: {
		width: SCREEN_WIDTH,
		position: 'absolute',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#000000AF'
	} as ViewStyle,
	unloggedBtns: {
		flexDirection: 'row'
	} as ViewStyle,
	toolbarStyle: {
		container: {
			backgroundColor: ICON_BLUE,
			height: 48
		},
		leftElement: {
			color: '#fff'
		},
		rightElement: {
			color: '#fff'
		},
		titleText: {
			color: '#fff'
		}
	} as ToolbarStyle,
	innerContainer: {
		position: 'relative',
		flex: 1
		// backgroundColor: '#fff'
	} as ViewStyle,
	sidebar: {
		flex: 1,
		backgroundColor: '#fff'
	} as ViewStyle,
	drawerAccountView: {
		height: 150,
		justifyContent: 'space-between',
		backgroundColor: 'rgb(158,158,158)'
	} as ViewStyle,
	drawerAvatorView: {
		height: 100,
		alignItems: 'center',
		justifyContent: 'center'
	} as ViewStyle,
	drawerAvatarImage: {
		height: 60,
		width: 60,
		borderRadius: 6,
		borderColor: '#fff',
		borderWidth: 1.5
	} as ImageStyle,
	drawerAccout: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 10,
		paddingBottom: 10
	} as ViewStyle,
	drawerItem: {
		width: 260,
		height: 42,
		flexDirection: 'row',
		paddingHorizontal: 10,
		paddingVertical: 5,
		marginVertical: 5,
		justifyContent: 'space-between',
		alignItems: 'center'
	} as ViewStyle
};
