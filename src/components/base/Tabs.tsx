import * as React from 'react';
import { View, ViewStyle, Text, TouchableOpacity, Dimensions, LayoutChangeEvent, TextStyle } from 'react-native';
import { observer } from 'mobx-react/native';
import { observable, action } from 'mobx';

export interface ITabsProps {
	elements: {
		title: string;
		elem: React.ReactElement<any>;
	}[];
	style?: ViewStyle;
	tabBarStyle?: {
		container?: ViewStyle;
		tabContainer?: ViewStyle;
		title?: TextStyle;
	};
	selectedColor?: string;
	unselectedColor?: string;
	selectedBackgroudColor?: string;
	unselectedBackgroudColor?: string;
	selectedUnderLineColor?: string;
	unselectedUnderLineColor?: string;
}

@observer
export default class Tabs extends React.Component<ITabsProps> {
	@observable tabBarWidth = Dimensions.get('window').width;
	@observable contentWidth = Dimensions.get('window').width;
	@observable contentHeight = Dimensions.get('window').height;

	static defaultProps = {
		selectedColor: '#fff',
		unselectedColor: '#fff',
		selectedBackgroudColor: '#2196f3',
		unselectedBackgroudColor: '#2196f3',
		selectedUnderLineColor: 'yellow',
		unselectedUnderLineColor: '#2196f3'
	};

	state = {
		currentTab: 0
	};

	render() {
		return (
			<View
				style={this.props.style ? this.props.style : {}}
				onLayout={action((e: LayoutChangeEvent) => {
					this.tabBarWidth = e.nativeEvent.layout.width;
				})}
			>
				<View
					style={{
						flexDirection: 'row',
						width: this.tabBarWidth,
						height: 48,
						...this.props.tabBarStyle ? (this.props.tabBarStyle.container ? {} : {}) : {}
					}}
				>
					{this.props.elements.map((e, i) => {
						return (
							<TouchableOpacity
								style={{
									flex: 1,
									alignItems: 'center',
									...this.props.tabBarStyle ? (this.props.tabBarStyle.tabContainer ? {} : {}) : {},
									backgroundColor:
										this.state.currentTab === i
											? this.props.selectedBackgroudColor
											: this.props.unselectedBackgroudColor,
									justifyContent: 'space-between'
								}}
								key={i}
								onPress={() => {
									this.setState((prevState) => ({ ...prevState, currentTab: i }));
								}}
							>
								<View
									style={{
										justifyContent: 'center',
										alignItems: 'center',
										flex: 1,
										marginBottom: -4
									}}
								>
									<Text
										style={{
											fontSize: 18,
											...this.props.tabBarStyle ? (this.props.tabBarStyle.title ? {} : {}) : {},
											color:
												this.state.currentTab === i
													? this.props.selectedColor
													: this.props.unselectedColor
										}}
									>
										{e.title}
									</Text>
								</View>
								<View
									style={{
										width: this.tabBarWidth / this.props.elements.length,
										backgroundColor:
											this.state.currentTab === i
												? this.props.selectedUnderLineColor
												: this.props.unselectedUnderLineColor,
										height: 2, 
									}}
								/>
							</TouchableOpacity>
						);
					})}
				</View>
				<View
					style={{ flex: 1 }}
					onLayout={action((e: LayoutChangeEvent) => {
						this.contentHeight = e.nativeEvent.layout.height;
						this.contentWidth = e.nativeEvent.layout.width;
					})}
				>
					{this.props.elements.map((e, i) => {
						return (
							<View
								style={{
									zIndex: this.state.currentTab === i ? 100 : 0,
									position: 'absolute',
									top: 0,
									left: 0,
									height: this.contentHeight,
									width: this.contentWidth,
									backgroundColor: '#fff'
								}}
								key={i}
							>
								{e.elem}
							</View>
						);
					})}
				</View>
			</View>
		);
	}
}
