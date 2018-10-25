import { observable } from 'mobx';
import { inject, observer } from 'mobx-react/native';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { BottomNavigation } from 'react-native-material-ui';
import { Store } from '@/store';
import { SCREEN_WIDTH } from '@/components/kit';

interface Props {
	store?: Store;
	navigation: any;
	jumpTo: (key: string) => void;
}

@inject('store')
@observer
export default class Home extends React.Component<Props> {
	@observable active: string = 'project';

	constructor(props: Props) {
		super(props);
	}

	render() {
		return (
			<BottomNavigation active={this.active} hidden={false}>
				{this.props.navigation.state.routes.map((route: any) => {
					let label = '',
						icon = '';
					if (route.key === 'project') {
						label = '项目';
						icon = 'widgets';
					} else if (route.key === 'share') {
						label = '分享';
						icon = 'share';
					} else if (route.key === 'feedback') {
						label = '反馈';
						icon = 'feedback';
					} else if (route.key === 'search') {
						label = '搜索';
						icon = 'search';
					} else if (route.key === 'me') {
						label = '我';
						icon = 'account-box';
					}
					return (
						<BottomNavigation.Action
							key={route.key}
							icon={icon}
							label={label}
							onPress={() => {
								this.props.jumpTo(route.key);
							}}
							active={false}
							style={{ container: { minWidth: SCREEN_WIDTH / 5 } }}
						/>
					);
				})}
			</BottomNavigation>
		);
	}

	componentDidMount() {
		this.props.store!.onSelectHomeBottomNav(this.onSelectHomeBottomNav);
	}

	onSelectHomeBottomNav = (active: 'project' | 'share' | 'feedback' | 'search' | 'me') => {
		this.active = active;
	};

	componentWillUnmount() {
		this.props.store!.offSelectHomeBottomNav(this.onSelectHomeBottomNav);
	}
}

const styles = StyleSheet.create({
	container: {} as ViewStyle
});

/*

  navigation: {
		state: {
			routes: [
				{
					key: 'project',
					isTransitioning: false,
					index: 0,
					routes: [
						{
							params: { initial: true, title: '项目', init: true },
							routeName: '_project',
							key: 'id-1536401128413-4'
						}
					],
					routeName: 'project',
					params: { initial: true, title: '项目', init: true }
				},
				{
					key: 'share',
					isTransitioning: false,
					index: 0,
					routes: [
						{
							params: { initial: true, title: '分享', init: true },
							routeName: '_share',
							key: 'id-1536401128413-5'
						}
					],
					routeName: 'share'
				},
				{
					key: 'feedback',
					isTransitioning: false,
					index: 0,
					routes: [
						{
							params: { initial: true, title: '反馈', init: true },
							routeName: '_feedback',
							key: 'id-1536401128413-6'
						}
					],
					routeName: 'feedback'
				}
			],
			index: 0,
			isTransitioning: false,
			params: { lazy: true, tabBarPosition: 'bottom', hideNavBar: true, init: true },
			routeName: 'home',
			key: 'id-1536401128413-7'
		},
		router: {
			childRouters: {
				project: { childRouters: { _project: null } },
				share: { childRouters: { _share: null } },
				feedback: { childRouters: { _feedback: null } }
			}
		},
		actions: {},
		_childrenNavigation: {
			project: {
				state: {
					key: 'project',
					isTransitioning: false,
					index: 0,
					routes: [
						{
							params: { initial: true, title: '项目', init: true },
							routeName: '_project',
							key: 'id-1536401128413-4'
						}
					],
					routeName: 'project',
					params: { initial: true, title: '项目', init: true }
				},
				router: { childRouters: { _project: null } },
				actions: {},
				_childrenNavigation: {
					'id-1536401128413-4': {
						state: {
							params: { initial: true, title: '项目', init: true },
							routeName: '_project',
							key: 'id-1536401128413-4'
						},
						actions: {}
					}
				}
			},
			share: {
				state: {
					key: 'share',
					isTransitioning: false,
					index: 0,
					routes: [
						{
							params: { initial: true, title: '分享', init: true },
							routeName: '_share',
							key: 'id-1536401128413-5'
						}
					],
					routeName: 'share'
				},
				router: { childRouters: { _share: null } },
				actions: {}
			},
			feedback: {
				state: {
					key: 'feedback',
					isTransitioning: false,
					index: 0,
					routes: [
						{
							params: { initial: true, title: '反馈', init: true },
							routeName: '_feedback',
							key: 'id-1536401128413-6'
						}
					],
					routeName: 'feedback'
				},
				router: { childRouters: { _feedback: null } },
				actions: {}
			}
		}
	},

*/
