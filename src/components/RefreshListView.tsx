import React, { PureComponent, Component } from 'react';
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	ActivityIndicator,
	TouchableOpacity,
	ViewStyle,
	ListRenderItem,
	NativeSyntheticEvent,
	NativeScrollEvent,
	TextStyle,
	FlatListProps
} from 'react-native';

interface Props<Item> extends FlatListProps<Item> {
	data: Array<Item>;
	renderItem: ListRenderItem<Item>;

	refreshState: RefreshStateType;
	onHeaderRefresh: (refreshState: RefreshStateType) => void;
	onFooterRefresh?: (refreshState: RefreshStateType) => void;

	footerContainerStyle?: ViewStyle;
	footerTextStyle?: TextStyle;

	listRef?: (list: FlatList<Item> | null) => void;

	footerRefreshingText?: string;
	footerFailureText?: string;
	footerNoMoreDataText?: string;
	footerEmptyDataText?: string;
}

export type RefreshStateType = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const RefreshState: {
	Idle: RefreshStateType; //普通状态
	HeaderRefreshing: RefreshStateType; //头部菊花转圈圈中
	FooterRefreshing: RefreshStateType; //底部菊花转圈圈中
	NoMoreData: RefreshStateType; //已加载全部数据
	Failure: RefreshStateType; //加载失败
	EmptyData: RefreshStateType;
	EndData: RefreshStateType;
} = {
	Idle: 0, //普通状态
	HeaderRefreshing: 1, //头部菊花转圈圈中
	FooterRefreshing: 2, //底部菊花转圈圈中
	NoMoreData: 3, //已加载全部数据
	Failure: 4, //加载失败
	EmptyData: 5,
	EndData: 6
};

export default class RefreshListView<Item = any> extends Component<Props<Item>> {
	render() {
		return (
			<FlatList
				{...this.props}
				data={this.props.data}
				renderItem={this.props.renderItem}
				ref={this.props.listRef}
				onScroll={this.onScroll}
				onRefresh={this.onHeaderRefresh}
				refreshing={this.props.refreshState === RefreshState.HeaderRefreshing}
				ListFooterComponent={this.renderFooter as any}
			/>
		);
	}

	// 上一次到的点
	private nativeEvent: NativeScrollEvent | null = null;

	private onScroll = (event?: NativeSyntheticEvent<NativeScrollEvent>) => {
		const nativeEvent = event!.nativeEvent;
		let previousOffsetY = 0;
		// contentOffset: 内容视图的原点偏离滚动视图的原点的点
		if (this.nativeEvent) {
			previousOffsetY = this.nativeEvent.contentOffset.y;
		}
		const offsetY = nativeEvent.contentOffset.y;
		/**
		 * 判断为上拉并且滚动到底部
		 */
		if (
			offsetY - previousOffsetY >= 0 &&
			Number.parseFloat(
				(offsetY -
					(nativeEvent.contentSize.height +
						nativeEvent.contentInset.bottom -
						nativeEvent.layoutMeasurement.height)).toFixed(2)
			) >= -1
		) {
			if (this.shouldStartFooterRefreshing()) {
				this.props.onFooterRefresh && this.props.onFooterRefresh(RefreshState.FooterRefreshing);
			}
		}
		this.nativeEvent = nativeEvent;
	};

	private shouldStartHeaderRefreshing = () => {
		log('[RefreshListView]  shouldStartHeaderRefreshing');
		if (
			this.props.refreshState === RefreshState.HeaderRefreshing ||
			this.props.refreshState === RefreshState.FooterRefreshing
		) {
			return false;
		}
		return true;
	};

	private shouldStartFooterRefreshing = () => {
		log('[RefreshListView]  shouldStartFooterRefreshing');
		let { refreshState, data } = this.props;
		if (data.length === 0) {
			return false;
		}
		return refreshState === RefreshState.Idle;
	};

	private onHeaderRefresh = () => {
		log('[RefreshListView]  onHeaderRefresh');

		if (this.shouldStartHeaderRefreshing()) {
			log('[RefreshListView]  onHeaderRefresh');
			this.props.onHeaderRefresh(RefreshState.HeaderRefreshing);
		}
	};

	private renderFooter = () => {
		let footer = null;

		let footerContainerStyle = [ styles.footerContainer, this.props.footerContainerStyle ];
		let footerTextStyle = [ styles.footerText, this.props.footerTextStyle ];
		let { footerRefreshingText, footerFailureText, footerNoMoreDataText, footerEmptyDataText } = this.props;

		switch (this.props.refreshState) {
			case RefreshState.Idle:
				footer = <View style={footerContainerStyle} />;
				break;
			case RefreshState.Failure: {
				footer = (
					<TouchableOpacity
						style={footerContainerStyle}
						onPress={() => {
							this.props.onFooterRefresh && this.props.onFooterRefresh(RefreshState.FooterRefreshing);
						}}
					>
						<Text style={footerTextStyle}>{footerFailureText}</Text>
					</TouchableOpacity>
				);
				break;
			}
			case RefreshState.EmptyData: {
				footer = (
					<TouchableOpacity
						style={footerContainerStyle}
						onPress={() => {
							this.props.onFooterRefresh && this.props.onFooterRefresh(RefreshState.FooterRefreshing);
						}}
					>
						<Text style={footerTextStyle}>{footerEmptyDataText}</Text>
					</TouchableOpacity>
				);
				break;
			}
			case RefreshState.FooterRefreshing: {
				footer = (
					<View style={footerContainerStyle}>
						<ActivityIndicator size="small" color="#888888" />
						<Text style={[ footerTextStyle, { marginLeft: 7 } ]}>{footerRefreshingText}</Text>
					</View>
				);
				break;
			}
			case RefreshState.NoMoreData: {
				footer = (
					<View style={footerContainerStyle}>
						<Text style={footerTextStyle}>{footerNoMoreDataText}</Text>
					</View>
				);
				break;
			}

			case RefreshState.EndData: {
				footer = null;
			}
		}

		return footer;
	};

	static defaultProps = {
		footerRefreshingText: '加载中…',
		footerFailureText: '点击重新加载',
		footerNoMoreDataText: '已加载全部数据',
		footerEmptyDataText: '服务器没有数据'
	};

	componentWillReceiveProps(nextProps: Props<Item>) {
		log('[RefreshListView]  RefreshListView componentWillReceiveProps ' + nextProps.refreshState);
	}

	componentDidUpdate(prevProps: Props<Item>) {
		log('[RefreshListView]  RefreshListView componentDidUpdate ' + prevProps.refreshState);
	}
}

const DEBUG = false;
const log = (text: string) => {
	DEBUG && console.log(text);
};

const styles = StyleSheet.create({
	footerContainer: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 10,
		height: 44
	},
	footerText: {
		fontSize: 14,
		color: '#555555'
	}
});
