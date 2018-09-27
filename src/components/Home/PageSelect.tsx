import React from 'react';
import {
	View,
	StyleSheet,
	ViewStyle,
	Dimensions,
	TouchableWithoutFeedback,
	TouchableOpacity,
	Text,
	TextStyle,
	FlatList
} from 'react-native';

interface Props {
	currPage: number;
	totalPage: number;
	onCurrPageSelect: (currPage: number) => void;
	btnText?: string;
}

interface State {
	open: boolean;
}

export default class PageSelect extends React.Component<Props, State> {
	state = {
		open: false
	};
	private list: FlatList<number> | null = null;

	render() {
		if (this.state.open) {
			return (
				<TouchableWithoutFeedback
					onPress={() => {
						this.setState({ open: false });
					}}
				>
					<View style={styles.over}>
						<FlatList
							data={Array.from(
								new Array(this.props.totalPage > 0 ? this.props.totalPage : 0),
								(val, index) => index + 1
							)}
							renderItem={({ item }) => {
								const style =
									item === this.props.currPage ? styles.selectedPage : styles.unselectedPage;
								return (
									<TouchableOpacity
										onPress={() => {
											this.props.onCurrPageSelect(item);
											this.setState({ open: false });
										}}
									>
										<Text style={style}>{item}</Text>
									</TouchableOpacity>
								);
							}}
							keyExtractor={(item) => item.toString()}
							style={styles.pageList}
							ref={(r) => {
								this.list = r;
								if (this.list) { 
									setTimeout(() => {
										this.list &&
											this.list.scrollToIndex({
												animated: false,
												index: this.props.currPage - 1,
												viewPosition: 0.5
											});
									}, 500);
								}
							}}
							ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#fff' }} />}
							getItemLayout={(data, index) => ({ length: 33, offset: (33 + 1) * index, index })}
						/>
					</View>
				</TouchableWithoutFeedback>
			);
		} else {
			return (
				<TouchableOpacity
					style={styles.pageButton}
					onPress={() => {
						this.setState({ open: true });
					}}
				>
					<Text style={styles.btnText}>{this.props.btnText ? this.props.btnText : '页码'}</Text>
				</TouchableOpacity>
			);
		}
	}
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const styles = StyleSheet.create({
	pageButton: {
		position: 'absolute',
		right: 0,
		top: SCREEN_HEIGHT * 0.25
	} as ViewStyle,
	btnText: {
		fontSize: 24,
		width: 26,
		padding: 1,
		backgroundColor: '#2196f3bf',
		color: '#EAEAEF',
		borderTopLeftRadius: 2,
		borderBottomLeftRadius: 2
	} as TextStyle,
	over: {
		position: 'absolute',
		left: 0,
		top: 0,
		width: SCREEN_WIDTH,
		height: SCREEN_HEIGHT,
		backgroundColor: '#FFFFFF00'
	} as ViewStyle,
	pageList: {
		position: 'absolute',
		right: 0,
		top: SCREEN_HEIGHT * 0.15,
		height: SCREEN_HEIGHT * 0.6,
		width: SCREEN_WIDTH * 0.2,
		backgroundColor: '#F8F8FF',  
		borderTopLeftRadius: 2,
		borderBottomLeftRadius: 2
	} as ViewStyle,
	selectedPage: {
		fontSize: 20,
		paddingLeft: 5,
		paddingRight: 5,
		paddingTop: 3,
		paddingBottom: 3,
		backgroundColor: '#6495ED',
		color: '#EAEAEF'
	} as TextStyle,
	unselectedPage: {
		fontSize: 20,
		paddingLeft: 5,
		paddingRight: 5,
		paddingTop: 3,
		paddingBottom: 3,
		backgroundColor: '#EAEAEF'
	} as TextStyle
});
