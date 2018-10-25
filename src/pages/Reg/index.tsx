import { Modal } from 'antd-mobile-rn';
import axios from 'axios';
import { action, autorun, IReactionDisposer, observable } from 'mobx';
import { inject, observer } from 'mobx-react/native';
import React from 'react';
import { Image, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Button, Overlay, Text as TextRNE } from 'react-native-elements';
import IconFontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { retryDo } from '@/kit';
import { Store } from '@/store';
import * as doing_status from '@/store/doing_status';
import { DoingStatus } from '@/store/doing_status';
import { baseUrl } from '@/kit/req';
import { reg, req } from '@/store/web';
import { BACK_WHITE, ICON_BLUE } from '@/themes/color';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '@/components/kit';
import Router from '@/router';
const { Input } = require('react-native-elements');

interface Props {
	store?: Store;
}

@inject('store')
@observer
export default class Reg extends React.Component<Props> {
	@observable getLogin: DoingStatus = doing_status.init;
	@observable nickName: string = '';
	@observable userName: string = '';
	@observable password: string = '';
	@observable captcha: string = '';
	@observable captchaImg: string = whiteImg;
	@observable reging: boolean = false;
	@observable errorMsg: string = '';

	constructor(props: Props) {
		super(props);
	}

	render() {
		return (
			<View style={styles.container}>
				<Text style={styles.logo}>JFinal</Text>
				<Input
					value={this.nickName}
					onChangeText={(text: string) => (this.nickName = text)}
					placeholder="昵称"
					inputStyle={{ fontSize: 16 } as TextStyle}
					leftIcon={<IconFontAwesome5 name="user" size={24} color="black" />}
					containerStyle={{ marginTop: 20 }}
					textContentType={'nickname'}
				/>
				<Input
					value={this.userName}
					onChangeText={(text: string) => (this.userName = text)}
					placeholder="邮箱"
					inputStyle={{ fontSize: 16 } as TextStyle}
					leftIcon={<IconMaterialCommunityIcons name="email" size={24} color="black" />}
					containerStyle={{ marginTop: 20 }}
					textContentType={'emailAddress'}
					keyboardType={'email-address'}
				/>
				<Input
					value={this.password}
					onChangeText={(text: string) => (this.password = text)}
					placeholder="密码"
					inputStyle={{ fontSize: 16 } as TextStyle}
					leftIcon={<IconMaterialCommunityIcons name="lock" size={24} color="black" />}
					containerStyle={{ marginTop: 20 }}
					textContentType={'password'}
					keyboardType={'visible-password'}
				/>
				<Input
					value={this.captcha}
					onChangeText={(text: string) => (this.captcha = text)}
					placeholder="验证码"
					inputStyle={{ fontSize: 16 } as TextStyle}
					leftIcon={<IconMaterialCommunityIcons name="security" size={24} color="black" />}
					rightIcon={
						<TouchableOpacity onPress={this.refreshCaptchaImg} disabled={this.captchaImg === whiteImg}>
							<Image source={{ uri: this.captchaImg }} style={{ width: 95, height: 31 }} />
						</TouchableOpacity>
					}
					containerStyle={{ marginTop: 20 }}
					textContentType={'password'}
				/>
				<Button
					title={
						this.getLogin === doing_status.end ? (
							'注册'
						) : this.getLogin === doing_status.fail ? (
							'网络有问题！'
						) : (
							'初始化..'
						)
					}
					loading={this.getLogin !== doing_status.end || this.reging}
					disabled={this.captchaImg === whiteImg || this.getLogin !== doing_status.end}
					loadingProps={{ size: 'large', color: 'rgba(111, 202, 186, 1)' }}
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
					onPress={this.onReg}
				/>
				<TouchableOpacity onPress={this.back} style={styles.back}>
					<IconMaterialIcons name="arrow-back" size={30} color="#3a5795" />
				</TouchableOpacity>
				<Text style={styles.reg} onPress={this.goLogin}>
					登录
				</Text>
				<Overlay
					isVisible={this.errorMsg.trim() !== ''}
					windowBackgroundColor="#aaaaaa0f"
					overlayBackgroundColor={BACK_WHITE}
					width="auto"
					height="auto"
				>
					<IconMaterialIcons name={'error'} size={36} style={{ alignSelf: 'center' }} color="red" />
					<TextRNE h4>{this.errorMsg}</TextRNE>
				</Overlay>
			</View>
		);
	}

	private onReg = async () => {
		this.reging = true;
		if (this.getLogin === doing_status.end) {
			const ret = await reg(this.nickName, this.userName, this.password, this.captcha);
			if (ret.isOk) {
				Modal.alert('注册成功', ret.get('msg'), [
					{
						text: 'OK',
						onPress: () => {
							Router.home()
						}
					}
				]);
			} else {
				this.refreshCaptchaImg();
				this.errorMsg = ret.get('msg');
				setTimeout(() => {
					this.errorMsg = '';
				}, 3000);
			}
			this.reging = false;
		}
	};

	@action
	private refreshCaptchaImg = async () => {
		this.captchaImg = whiteImg;
		this.captcha = '';
		const resp = await axios.get<Blob>(`${baseUrl}/login/captcha?v=${Math.random()}`, {
			responseType: 'blob'
		}); 
		const blob = resp.data;
		const reader = new FileReader();
		reader.onloadend = () => {
			this.captchaImg = reader.result!.toString();
			this.captchaImg = this.captchaImg.replace(/data:application\/octet-stream;/, 'data:image/jpeg;');
		};
		reader.readAsDataURL(blob);
	};

	private back = () => {
		Router.pop();
	};

	private goLogin = () => {
		Router.login(true); 
	};

	private closers: IReactionDisposer[] = [];

	componentDidMount() {
		this.getLogin = doing_status.running;
		this.closers.push(
			autorun(() => {
				if (this.getLogin === 2) {
					this.refreshCaptchaImg();
				}
			})
		);
		retryDo(async () => {
			await req.GET('/reg');
		}, 3)
			.then(() => {
				this.getLogin = doing_status.end;
			})
			.catch(() => {
				this.getLogin = doing_status.fail;
			});
	}

	componentWillUnmount() {
		for (let closer of this.closers) {
			closer();
		}
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: BACK_WHITE,
		alignItems: 'center',
		justifyContent:"center", 
	} as ViewStyle,
	logo: {
		fontSize: 64,
		color: '#3a5795',
		// marginTop: SCREEN_HEIGHT * 0.1
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
		color: '#3a5795',
		position: 'absolute',
		top: SCREEN_WIDTH * 0.05,
		right: SCREEN_WIDTH * 0.05
	} as TextStyle
});

const whiteImg =
	'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwcGBwgGBw0NBwYHDQ0PBwcHBw8ICQcWFREWIhQRHxUYHSggGBolGxUfITEhJSkrLi4uFx8zODMsNygtLisBCgoKBQUFDgUFDisZExkrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK//AABEIAOEA4QMBIgACEQEDEQH/xAAVAAEBAAAAAAAAAAAAAAAAAAAAB//EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AuIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/9k=';
