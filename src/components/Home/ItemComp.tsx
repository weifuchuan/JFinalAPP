import React from 'react';
import { View, StyleSheet, ViewStyle, Text, TextStyle, Image, ImageStyle } from 'react-native';
import { observer } from 'mobx-react/native';
import { Item } from './kit';
import { Card } from 'react-native-material-ui';
import { baseUrl } from '../../store/req';
import { getNoCacheValue } from '../base/kit';
import Touchable from '../base/Touchable';

interface Props {
	item: Item;
	onPress: (item: Item) => void;
}

@observer
export default class ItemComp extends React.Component<Props> {
	render() {
		const item = this.props.item;
		return (
			<Touchable onPress={() => this.props.onPress(item)}>
				<View style={styles.container}>
					<View style={styles.avatarAndTitle}>
						<Image source={{ uri: `${baseUrl}${item.avatar}?donotCache=${getNoCacheValue()}` }} style={styles.avatar} />
						<Text style={styles.title}>{item.title}</Text>
					</View>
					<Text style={styles.content}>{item.content.trim() + '...'}</Text>
				</View>
			</Touchable>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 10,
		paddingVertical:10, 
		flex: 1,
		backgroundColor:"#fff",
	} as ViewStyle,
	avatarAndTitle: {
		flexDirection: 'row'
	} as ViewStyle,
	avatar: {
		width: 50,
		height: 50
	} as ImageStyle,
	title: {
		flex: 1,
		marginLeft: 6,
		color: '#000000',
		fontSize: 20
	} as TextStyle,
	content: {
		marginTop: 6,
		fontSize: 15
	} as TextStyle
});
