import { observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { StyleSheet, TextStyle, TouchableOpacity, View, ViewStyle, Text } from 'react-native';
import { Button } from 'react-native-elements';
import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Store } from '../../store';
import { BACK_WHITE, ICON_BLUE } from '../base/color';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../base/kit';
import Router from '../Router';
import { updatePassword } from '../../store/web';
import { Toast } from 'antd-mobile-rn';
const { Input } = require('react-native-elements');

interface Props {
	store?: Store;
}

@inject('store')
@observer
export default class Login extends React.Component<Props> {
	@observable oldPassword: string = '';
	@observable newPassword: string = '';

	constructor(props: Props) {
		super(props);
	}

	render() {
		return (
			<View style={styles.container}>
        <Text style={styles.logo}>修改密码</Text>
				<Input
					value={this.oldPassword}
					onChangeText={(text: string) => (this.oldPassword = text)}
					secureTextEntry={true}
					placeholder="原密码"
					inputStyle={{ fontSize: 16 } as TextStyle}
					leftIcon={<IconMaterialCommunityIcons name="lock" size={24} color="black" />}
					containerStyle={{ marginTop: 20 }}
					textContentType={'password'}
				/>
				<Input
					value={this.newPassword}
					onChangeText={(text: string) => (this.newPassword = text)}
					secureTextEntry={true}
					placeholder="新密码"
					inputStyle={{ fontSize: 16 } as TextStyle}
					leftIcon={<IconMaterialCommunityIcons name="lock" size={24} color="black" />}
					containerStyle={{ marginTop: 20 }}
					textContentType={'password'}
				/>
				<Button
					title={'提交'}
					titleStyle={{ fontWeight: '700' }}
					buttonStyle={{
						backgroundColor: 'rgba(92, 99,216, 1)',
						width: SCREEN_WIDTH * 0.9,
						height: 45,
						borderColor: 'transparent',
						borderWidth: 0,
						borderRadius: 5
					}}
					containerStyle={{ marginTop: 20 }}
					onPress={this.onSubmit}
				/>
				<TouchableOpacity onPress={this.back} style={styles.back}>
					<IconMaterialIcons name="arrow-back" size={30} color="#3a5795" />
				</TouchableOpacity>
			</View>
		);
	}

	onSubmit = async () => {
		const ret = await updatePassword(this.oldPassword, this.newPassword);
		if (ret.isOk) {
			Toast.success('更新密码成功', 2);
			Router.pop();
		} else {
			Toast.fail(ret.get('msg'));
		}
	};

	private back = () => {
		Router.pop();
	};
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: BACK_WHITE,
		alignItems: 'center',
		justifyContent: 'center'
	} as ViewStyle,
	logo: {
		fontSize: 48,
		color: ICON_BLUE, 
	} as TextStyle,
	forgetPassword: {
		marginTop: 20,
		alignSelf: 'flex-end',
		marginRight: SCREEN_WIDTH * 0.05
	} as TextStyle,
	back: {
		position: 'absolute',
		top: SCREEN_WIDTH * 0.05,
		left: SCREEN_WIDTH * 0.05
	} as ViewStyle,
	reg: {
		fontSize: 20,
		color: ICON_BLUE,
		position: 'absolute',
		top: SCREEN_WIDTH * 0.05,
		right: SCREEN_WIDTH * 0.05
	} as TextStyle
});
