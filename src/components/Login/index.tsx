import React from 'react';
import { View, StyleSheet, ViewStyle, Dimensions, Image, TouchableOpacity, TextStyle, Text } from 'react-native';
import { observer, inject } from 'mobx-react/native';
import { Store } from '../../store';
import { req, login } from '../../store/web';
import { DoingStatus } from '../../store/doing_status';
import * as doing_status from '../../store/doing_status';
import { observable, autorun, IReactionDisposer, action } from 'mobx';
const { Input } = require('react-native-elements');
import IconMaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Button, CheckBox, Overlay, Text as TextRNE } from 'react-native-elements';
import _ from 'lodash';
import { BACK_WHITE, ICON_BLUE } from '../base/color';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../base/kit';
import { retryDo } from '../../kit';
import Router from '../Router';
import { Observer } from 'mobx-react/native';
import { Toast } from 'antd-mobile-rn';
const Overlay2 = require('teaset').Overlay;

interface Props {
	store?: Store;
}

@inject('store')
@observer
export default class Login extends React.Component<Props> {
	@observable getLogin: DoingStatus = doing_status.init;
	@observable userName: string = '';
	@observable password: string = '';
	@observable captcha: string = '';
	@observable keepLogin: boolean = true;
	@observable captchaImg: string = whiteImg;
	@observable loging: boolean = false;
	@observable errorMsg: string = '';
	overlayKey: any;
	@observable retrievePasswordEmail: string = '';
	@observable retrieving: boolean = false;

	constructor(props: Props) {
		super(props);
	}

	render() {
		return (
			<View style={styles.container}>
				<Text style={styles.logo}>JFinal</Text>
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
					secureTextEntry={true}
					placeholder="密码"
					inputStyle={{ fontSize: 16 } as TextStyle}
					leftIcon={<IconMaterialCommunityIcons name="lock" size={24} color="black" />}
					containerStyle={{ marginTop: 20 }}
					textContentType={'password'}
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
				<CheckBox
					containerStyle={{
						marginTop: 20,
						alignSelf: 'flex-end',
						backgroundColor: BACK_WHITE,
						padding: 0
					}}
					checked={this.keepLogin}
					title={'保持登录'}
					onPress={() => (this.keepLogin = !this.keepLogin)}
				/>
				<Button
					title={
						this.getLogin === doing_status.end ? (
							'登录'
						) : this.getLogin === doing_status.fail ? (
							'网络有问题！'
						) : (
							'初始化..'
						)
					}
					loading={this.getLogin !== doing_status.end || this.loging}
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
					onPress={this.onLogin}
				/>
				<Text onPress={this.forgetPassword} style={styles.forgetPassword}>
					忘记密码？
				</Text>
				<TouchableOpacity onPress={this.back} style={styles.back}>
					<IconMaterialIcons name="arrow-back" size={30} color="#3a5795" />
				</TouchableOpacity>
				<Text style={styles.reg} onPress={this.goReg}>
					注册
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

	private onLogin = async () => {
		this.loging = true;
		if (this.getLogin === doing_status.end) {
			const ret = await login(this.userName, this.password, this.captcha, this.keepLogin);
			if (ret.isOk) {
				this.props.store!.me = observable(ret.get('account'));
				this.props.store!.emitLogged();
				if (this.keepLogin) this.props.store!.saveMe();
				Router.pop();
			} else {
				this.refreshCaptchaImg();
				this.errorMsg = ret.get('msg');
				setTimeout(() => {
					this.errorMsg = '';
				}, 1500);
			}
			this.loging = false;
		}
	};

	@action
	private refreshCaptchaImg = async () => {
		this.captchaImg = whiteImg;
		this.captcha = '';
		const resp = await req.GET(`/login/captcha?v=${Math.random()}`, null, { responseType: 'blob' });
		const blob = resp.data;
		const reader = new FileReader();
		reader.onerror = (evt) => {
			console.log(reader.error);
		};
		reader.onloadend = () => {
			this.captchaImg = reader.result!.toString();
			this.captchaImg = this.captchaImg.replace(/data:application\/octet-stream;/, 'data:image/jpeg;');
		};
		reader.readAsDataURL(blob);
	};

	private forgetPassword = async () => {
		this.overlayKey = Overlay2.show(
			<Overlay2.PopView
				type="zoomIn"
				overlayOpacity={0.5}
				style={{ alignItems: 'center', justifyContent: 'center' }}
			>
				<Observer>
					{() => (
						<View
							style={{
								backgroundColor: '#fff',
								width: SCREEN_WIDTH * 0.9,
								paddingVertical: 20,
								borderRadius: 10,
								justifyContent: 'center',
								alignItems: 'center'
							}}
						>
							<Input
								value={this.retrievePasswordEmail}
								onChangeText={(text: string) => (this.retrievePasswordEmail = text)}
								placeholder="填写注册邮箱"
								inputStyle={{ fontSize: 16 } as TextStyle}
								leftIcon={<IconMaterialCommunityIcons name="email" size={24} color="black" />}
								textContentType={'emailAddress'}
								keyboardType={'email-address'}
							/>
							<Button
								title={'找回密码'}
								disabled={
									!/^([A-Za-z0-9_\-\.\u4e00-\u9fa5])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{1,8})$/.test(
										this.retrievePasswordEmail
									)
								}
								loading={this.retrieving}
								titleStyle={{ fontWeight: '700' }}
								containerStyle={{ marginTop: 10 }}
								onPress={async () => {
									const res = (await req.POST_FORM('/login/sendRetrievePasswordEmail', {
										email: this.retrievePasswordEmail
									})).data;
									if (res.state === 'ok') {
										Toast.success(res.msg);
										Overlay2.hide(this.overlayKey);
									} else {
										Toast.fail(res.msg, 2);
									}
								}}
							/>
						</View>
					)}
				</Observer>
			</Overlay2.PopView>
		);
	};

	private back = () => {
		Router.pop();
	};

	private goReg = () => {
		Router.reg(true);
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
			await req.GET('/login');
		}, 3)
			.then((resp) => {
				this.getLogin = doing_status.end;
			})
			.catch((err) => {
				this.getLogin = doing_status.fail;
				console.log(err);
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
		alignItems: 'center'
	} as ViewStyle,
	logo: {
		fontSize: 64,
		color: ICON_BLUE,
		marginTop: SCREEN_HEIGHT * 0.15
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

const whiteImg =
	'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwcGBwgGBw0NBwYHDQ0PBwcHBw8ICQcWFREWIhQRHxUYHSggGBolGxUfITEhJSkrLi4uFx8zODMsNygtLisBCgoKBQUFDgUFDisZExkrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK//AABEIAOEA4QMBIgACEQEDEQH/xAAVAAEBAAAAAAAAAAAAAAAAAAAAB//EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AuIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/9k=';
