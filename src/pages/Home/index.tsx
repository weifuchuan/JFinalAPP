import { observable } from 'mobx';
import { inject, observer } from 'mobx-react/native';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { BottomNavigation } from 'react-native-material-ui';
import { Store } from '@/store';
import { SCREEN_WIDTH } from '@/components/kit';
import Router from '@/router/index';

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
				{this.props.navigation.state.routes
					.map((route: any) => {
						let label = '',
							icon = '',
							onPress = () => {
								this.props.jumpTo(route.key);
							},
							addition = null,
							minWidth = SCREEN_WIDTH / 6;
						if (route.key === 'project') {
							label = '项目';
							icon = 'widgets';
						} else if (route.key === 'share') {
							label = '分享';
							icon = 'share';
						} else if (route.key === 'feedback') {
							label = '反馈';
							icon = 'feedback';
							addition = (
								<BottomNavigation.Action
									key={'doc'}
									icon={'insert-drive-file'}
									label={'文档'}
									onPress={() => Router.doc()}
									active={false}
									style={{ container: { minWidth } }}
								/>
							);
						} else if (route.key === 'search') {
							label = '搜索';
							icon = 'search';
						} else if (route.key === 'me') {
							label = '我';
							icon = 'account-box';
						}
						return [
							<BottomNavigation.Action
								key={route.key}
								icon={icon}
								label={label}
								onPress={onPress}
								active={false}
								style={{ container: { minWidth } }}
							/>,
							addition
						];
					})
					.reduce(
						(p: React.ReactNode[], n: React.ReactNode[]) => (p.push(...n), p.filter((e) => e != null)),
						[]
					)}
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
