import { ActionSheet, Badge, Drawer, Modal } from 'antd-mobile-rn';
import { action, autorun, IReactionDisposer, observable, runInAction } from 'mobx';
import { inject, observer } from 'mobx-react/native';
import React from 'react';
import { Dimensions, Image, ImageStyle, LayoutChangeEvent, ScrollView, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Button, Toolbar, ToolbarStyle } from 'react-native-material-ui';
import { RouteBase, TabView } from 'react-native-tab-view';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { retryDo } from '../../kit';
import { Store } from '../../store';
import { Account } from '../../store/types';
import { req } from '../../store/web';
import { BACK_WHITE, ICON_BLUE } from '../base/color';
import { measure, SCREEN_HEIGHT, SCREEN_WIDTH } from '../base/kit';
import StatusBar from '../base/StatusBar';
import Touchable from '../base/Touchable';
import NewsfeedList from '../NewsfeedList';
import Router from '../Router'; 
const { Overlay } = require('teaset');
const cheerio: CheerioAPI = require('react-native-cheerio');

interface Props {
	store?: Store;
	toReferMe?: boolean;
}

@inject('store')
@observer
export default class Me extends React.Component<Props> {
	@observable containerHeight: number = SCREEN_HEIGHT - 58.7 - (StatusBar.source.currentHeight || 22);
	@observable openDrawer = false;
	@observable followCnt = 0;
	@observable fansCnt = 0;
	@observable likeCnt = 0;
	@observable innerConWidth = 0;
	@observable innerConHeight = 0;
	@observable tabIndex = 0;
	popoverKey: any;
	@observable noticeBounds = { x: SCREEN_WIDTH - 24, y: 36, width: 0, height: 0 };

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
			text: () => '我的分享',
			type: 'share'
		},
		{
			text: () => '我的反馈',
			type: 'feedback'
		},
		{
			text: () => '我的项目',
			type: 'project'
		},
		{
			text: () => '我的私信',
			type: 'message'
		},
		{
			text: () => '我的收藏',
			type: 'favorite'
		}
	];

	newsfeedCache?: JSX.Element;
	hotCache?: JSX.Element;
	referMeCache?: JSX.Element; 

	render() {
		const store = this.props.store!;
		const me = store.me
			? store.me
			: {
					id: 0,
					nickName: '',
					avatar: '',
					userName: '',
					createAt: new Date().toString(),
					ip: '',
					likeCount: 0,
					sessionId: '',
					status: 1
				} as Account;
		return (
			<View
				style={styles.container}
				onLayout={(evt) => {
					this.containerHeight = evt.nativeEvent.layout.height;
				}}
			>
				<Drawer
					position="left"
					open={this.openDrawer}
					onOpenChange={(isOpen) => (this.openDrawer = isOpen)}
					drawerWidth={260}
					sidebar={
						<View style={styles.sidebar}>
							<View style={styles.drawerAccountView}>
								<View style={styles.drawerAvatorView}>
									<Touchable onPress={this.onAccountPress}>
										<Image
											source={{
												uri: `${req.baseUrl}/upload/avatar/${me.avatar}`
											}}
											style={styles.drawerAvatarImage}
										/>
									</Touchable>
								</View>
								<Touchable onPress={this.onAccountPress}>
									<View style={styles.drawerAccout}>
										<View style={{ justifyContent: 'space-evenly' }}>
											<Text style={{ fontSize: 18 }}>{me.nickName}</Text>
											<Text style={{ fontSize: 16 }}>{me.userName}</Text>
										</View>
										<View>
											<MaterialIcons name={'arrow-drop-down'} size={36} />
										</View>
									</View>
								</Touchable>
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
							leftElement={
								<Touchable onPress={() => (this.openDrawer = true)}>
									<Image
										source={{ uri: `${req.baseUrl}/upload/avatar/${me.avatar}` }}
										style={styles.toolbarLeftAvatar}
									/>
								</Touchable>
							}
							centerElement={me.nickName}
							rightElement={
								this.props.store!.reminds.length === 0 ? (
									<Text style={{ fontSize: 16, color: '#fff', padding: 10 }}>通知</Text>
								) : (
									<TouchableOpacity onPress={this.onNoticePress}>
										<View style={{ padding: 10 }} onLayout={this.onNoticeLayout}>
											<Badge dot size="small">
												<Text style={{ fontSize: 16, color: '#fff' }}>通知</Text>
											</Badge>
										</View>
									</TouchableOpacity>
								)
							}
							style={styles.toolbarStyle}
						/>
						<View
							style={styles.innerContainer}
							onLayout={action((e: LayoutChangeEvent) => {
								this.innerConHeight = e.nativeEvent.layout.height;
								this.innerConWidth = e.nativeEvent.layout.width;
							})}
						>
							<TabView
								navigationState={{
									index: this.tabIndex,
									routes: [
										{
											key: 'newsfeed',
											title: '动态'
										} as any,
										{
											key: 'hot',
											title: '热门'
										} as any,
										{
											key: 'referMe',
											title: '@提到我'
										} as any
									]
								}}
								onIndexChange={(i) => (this.tabIndex = i)}
								renderScene={this.renderScene}
								initialLayout={{
									height: 0,
									width: Dimensions.get('window').width
								}} 
							/>
						</View>
					</View>
				</Drawer>
				{/*未登录*/ store.me ? null : (
					<View
						style={{
							width: SCREEN_WIDTH,
							height: this.containerHeight,
							position: 'absolute',
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: '#000000AF'
						}}
					>
						<View style={styles.unloggedBtns}>
							<Button
								text={'登录'}
								style={{
									container: {
										backgroundColor: '#9370DB',
										paddingLeft: 20,
										paddingRight: 20,
										paddingTop: 16,
										paddingBottom: 16
									},
									text: { color: '#FFF', fontSize: 20 }
								}}
								onPress={() => {
									Router.login();
								}}
							/>
							<Button
								text={'注册'}
								style={{
									container: {
										backgroundColor: '#3CB371',
										marginLeft: SCREEN_WIDTH * 0.05,
										paddingLeft: 20,
										paddingRight: 20,
										paddingTop: 16,
										paddingBottom: 16
									},
									text: { color: '#FFF', fontSize: 20 }
								}}
								onPress={() => {
									Router.reg();
								}}
							/>
						</View>
					</View>
				)}
			</View>
		);
	}

	renderScene = ({ route }: { route: RouteBase }): React.ReactNode => {
		switch (route.key) {
			case 'newsfeed':
				if (this.newsfeedCache) {
					return this.newsfeedCache;
				}
				return (this.newsfeedCache = <NewsfeedList uri={'/my'} style={{ flex: 1 }} shouldCache />);
			case 'hot':
				if (this.hotCache) {
					return this.hotCache;
				}
				return (this.hotCache = <NewsfeedList uri={'/my/hot'} style={{ flex: 1 }} shouldCache />);
			case 'referMe':
				if (this.referMeCache) {
					return this.referMeCache;
				}
				return (this.referMeCache = (
					<NewsfeedList uri={'/my/referMe'} style={{ flex: 1 }} shouldCache  />
				));
			default:
				return null;
		}
	};

	private readonly onAccountPress = () => {
		ActionSheet.showActionSheetWithOptions(
			{
				options: [ '更换头像', '修改密码', '退出登录', '取消' ],
				cancelButtonIndex: 3,
				destructiveButtonIndex: 2
			},
			(index: number) => {
				if (index === 0) {
					// 更换头像
					Router.uploadAvatar();
				} else if (index === 1) {
					Router.updatePassword();
				} else if (index === 2) {
					Modal.alert('确认退出登录？', '退出后无法使用已登录的用户能使用的功能。', [
						{
							text: '确认',
							onPress: async () => {
								await this.props.store!.quit();
								await req.GET('/logout');
								this.props.store!.emitLogout();
							}
						},
						{ text: '取消', onPress: () => {} }
					]);
				} else {
				}
				this.openDrawer = false;
			}
		);
	};

	private onNoticeLayout = async (e: any) => {
		const res = await measure(e);
		runInAction(() => {
			res.x = res.pageX;
			res.y = (StatusBar.source.currentHeight || 0) + res.pageY;
			res.width = res.width;
			res.height = res.height;
		});
	};

	private onNoticePress = () => {
		this.popoverKey = Overlay.show(
			<Overlay.PopoverView
				showArrow={true}
				animated
				overlayOpacity={0}
				fromBounds={this.noticeBounds}
				popoverStyle={{ borderRadius: 5 } as ViewStyle}
			>
				<View style={{ width: 150, padding: 5, backgroundColor: '#fff', zIndex: 1000 }}>
					{this.props.store!.reminds.map((remind, index) => {
						return (
							<Touchable
								key={index.toString()}
								onPress={action(() => {
									if (remind.type === 'fans') {
										Router.friends('fans');
									} else if (remind.type === 'message') {
										Router.message();
									} else if (remind.type === 'referMe') {
										setTimeout(() => {
											this.props.store!.emitToReferMe();
										}, 0);
									}
									this.props.store!.reminds.splice(index, 1);
									Overlay.hide(this.popoverKey);
								})}
							>
								<Text style={{ fontSize: 16, marginVertical: 5 }}>{remind.text}</Text>
							</Touchable>
						);
					})}
				</View>
			</Overlay.PopoverView>
		);
	};

	private onDrawerItemPress(item: { text: (...params: any[]) => string; type: string }) {
		switch (item.type) {
			case 'follow':
				Router.friends('follow');
				break;
			case 'fans':
				Router.friends('fans');
				break;
			case 'like':
				break;
			case 'share':
				Router.myArticles('share');
				break;
			case 'feedback':
				Router.myArticles('feedback');
				break;
			case 'project':
				Router.myArticles('project');
				break;
			case 'message':
				Router.message();
				break;
			case 'favorite':
				Router.myFavorite();
				break;
		}
		this.openDrawer = false;
	}

	closers: IReactionDisposer[] = [];
	componentDidMount() {
		if (this.props.toReferMe) this.tabIndex = 2;

		this.closers.push(
			autorun(async () => {
				if (this.props.store!.me) {
					const html = await retryDo(async () => {
						return await req.GET_HTML('/my');
					}, 3);
					const $ = cheerio.load(html);
					runInAction(() => {
						const userFriendNums = $('.user-friend-num > a').toArray();
						this.followCnt = Number.parseInt($(userFriendNums[0]).text().match(/\d+/)![0]);
						this.fansCnt = Number.parseInt($(userFriendNums[1]).text().match(/\d+/)![0]);
						this.likeCnt = Number.parseInt($(userFriendNums[2]).text().match(/\d+/)![0]);
					});
				}
			})
		);

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

		this.props.store!.onLogged(this.onLogged);
		this.props.store!.onLogout(this.onLogout);
		this.props.store!.onToReferMe(this.onToReferMe);
	}

	onLogout = () => {};

	onLogged = () => {};

	onToReferMe = () => {
		this.tabIndex = 2; 
	};

	firstOpen = true;

	componentWillUnmount() {
		for (let closer of this.closers) {
			closer();
		}
		this.props.store!.offLogged(this.onLogged);
		this.props.store!.offLogout(this.onLogout);
		this.props.store!.offToReferMe(this.onToReferMe);
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
			color: '#000000'
		},
		rightElement: {
			color: '#000000'
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
