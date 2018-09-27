import React from 'react';
import { View, StyleSheet, ViewStyle, Text } from 'react-native';
import { observer, inject } from 'mobx-react';
import { Store } from '../../store';

interface Props {
	store?: Store;
	id:number;
}

@inject('store')
@observer
export default class User extends React.Component<Props> {
	render() {
		return (
			<View style={styles.container}>
				<Text>{this.props.id}</Text>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	} as ViewStyle
});
