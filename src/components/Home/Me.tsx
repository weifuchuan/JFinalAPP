import React from 'react';
import {
	View,
	StyleSheet,
	ViewStyle,
	Text,
	ScrollView,
	LayoutChangeEvent,
	Image,
	TouchableOpacity,
	Dimensions,
	FlatList,
	ImageStyle,
	NativeModules
} from 'react-native';
import { observer, inject } from 'mobx-react';
import { Store } from '../../store';
import {
	Button,
	Toolbar,
	ToolbarStyle,
	Drawer as Drawer2,
	Avatar,
	ListItemProps,
	ListItem
} from 'react-native-material-ui';
import { SCREEN_WIDTH, SCREEN_HEIGHT, measure } from '../base/kit';
import { observable, autorun, action, IReactionDisposer, runInAction } from 'mobx';
import { Account, NewsFeed } from '../../types';
import StatusBar from '../base/StatusBar';
import { BACK_WHITE } from '../base/color';
import { Drawer, Badge, ActionSheet, Modal } from 'antd-mobile-rn';
import { retryDo } from '../../kit';
import { req } from '../../store/web';
import NewsfeedList from '../NewsfeedList';
import Touchable from '../base/Touchable';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import Router from '../Router';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
const { Overlay } = require('teaset');
const cheerio: CheerioAPI = require('react-native-cheerio');

interface Props {
	store?: Store;
}

interface Remind {
	type: 'fans' | 'referMe' | 'message';
	text: string;
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
	@observable reminds: Remind[] = [];
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
								this.reminds.length === 0 ? (
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
								renderScene={SceneMap({
									newsfeed: () => <NewsfeedList uri={'/my'} style={{ flex: 1 }} shouldCache />,
									hot: () => <NewsfeedList uri={'/my/hot'} style={{ flex: 1 }} shouldCache />,
									referMe: () => <NewsfeedList uri={'/my/referMe'} style={{ flex: 1 }} shouldCache />
								})}
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
							onPress: () => {
								this.props.store!.quit();
								req.GET('/logout');
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
					{this.reminds.map((remind, index) => {
						return (
							<Touchable
								key={index.toString()}
								onPress={() => {
									if (remind.type === 'fans') {
										console.warn('fans');
									} else if (remind.type === 'message') {
										console.warn('message');
									} else if (remind.type === 'referMe') {
										console.warn('referMe');
									}
									Overlay.hide(this.popoverKey);
								}}
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
				break;
			case 'favorite':
				Router.myFavorite();
				break;
		}
		this.openDrawer = false;
	}

	closers: IReactionDisposer[] = [];
	componentDidMount() {
		this.closers.push(
			autorun(async () => {
				if (this.props.store!.me) {
					const html = await retryDo(async () => {
						return await req.GET_HTML('/my');
					}, 3);
					const $ = cheerio.load(html);
					runInAction(() => {
						if ($('.remind-layer').length > 0) {
							this.reminds.splice(0, this.reminds.length);
							$('.remind-layer > a').each((_, elem) => {
								try {
									let remind: Remind = { type: 'fans', text: '' };
									const href = $(elem).attr('href');
									remind.type = href.substring(href.lastIndexOf('/') + 1) as any;
									remind.text = $(elem).text().trim();
									this.reminds.push(observable(remind));
								} catch (e) {}
							});
						}

						const userFriendNums = $('.user-friend-num > a').toArray();
						runInAction(() => {
							this.followCnt = Number.parseInt($(userFriendNums[0]).text().match(/\d+/)![0]);
							this.fansCnt = Number.parseInt($(userFriendNums[1]).text().match(/\d+/)![0]);
							this.likeCnt = Number.parseInt($(userFriendNums[2]).text().match(/\d+/)![0]);
						});
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
			backgroundColor: '#2196f3',
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
