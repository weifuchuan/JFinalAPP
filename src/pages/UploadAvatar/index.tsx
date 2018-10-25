import React from 'react';
import { inject, observer } from 'mobx-react/native';
import { View, StyleSheet, ViewStyle, Text, ImageStyle, Image, TouchableWithoutFeedback, Alert } from 'react-native';
import { BACK_WHITE, ICON_BLUE } from '@/themes/color';
import { Toolbar } from 'react-native-material-ui';
import Router from '@/router';
import ImagePicker, { Image as IImage } from 'react-native-image-crop-picker';
import { observable } from 'mobx';
import { SCREEN_WIDTH } from '@/components/kit';
import pleaceSelectImage from './pleaceSelectImage';
import { Store } from '@/store';
import { req } from '@/store/web';
import { Toast } from 'antd-mobile-rn';
import Touchable from '@/components/Touchable';
const cheerio: CheerioAPI = require('react-native-cheerio');

@inject('store')
@observer
export default class UploadAvatar extends React.Component<{ store?: Store }> {
	@observable newAvatar: string = pleaceSelectImage;

	render() {
		return (
			<View style={styles.container}>
				<Toolbar
					leftElement={'arrow-back'}
					centerElement={'上传头像'}
					onLeftElementPress={() => Router.pop()}
					style={{ container: { backgroundColor: '#000' } }}
					rightElement={
						<Touchable onPress={this.onSave}>
							<Text style={{ fontSize: 18, color: '#fff' }}>保存</Text>
						</Touchable>
					}
				/>
				<View style={styles.innerContainer}>
					<Text style={{ fontSize: 24, color: '#fff' }}>新头像</Text>
					<TouchableWithoutFeedback onPress={this.selectNewAvatar}>
						<Image source={{ uri: this.newAvatar }} style={styles.avatar} resizeMode={'cover'} />
					</TouchableWithoutFeedback>
					<Text style={{ fontSize: 24, color: '#fff' }}>原头像</Text>
					<Image
						source={{ uri: `${req.baseUrl}/upload/avatar/${this.props.store!.me!.avatar}` }}
						style={styles.avatar}
						resizeMode={'cover'}
					/>
				</View>
			</View>
		);
	}

	onSave = async () => {
		if (this.newAvatar === pleaceSelectImage) {
			Alert.alert('请选择新图片');
			return;
		}
		Toast.loading('上传中');
		try {
			const resp = await req.updateFile('/my/setting/uploadAvatar', { avatar: this.newAvatar });
			if (resp.data['state'] === 'ok') {
				const resp = await req.POST_FORM('/my/setting/saveAvatar', { x: 0, y: 0, width: 300, height: 300 });
				if (resp.data['state'] === 'ok') {
					const html = await req.GET_HTML('/my');
					const $ = cheerio.load(html);
					const src = $('.user-info.clearfix > a > img').attr('src');
					this.props.store!.me!.avatar =
						src.substring('/upload/avatar/'.length) + '?donotCache=' + new Date().getTime();
					Toast.hide();
					Toast.success('头像更新成功');
					Router.pop();
				} else {
					Toast.hide();
					Toast.fail(resp.data['msg']);
				}
			} else {
				Toast.hide();
				Toast.fail(resp.data['msg']);
			}
		} catch (err) {
			Toast.fail('网络异常');
		}
	};

	selectNewAvatar = async () => {
		const image = (await ImagePicker.openPicker({
			width: 300,
			height: 300,
			cropping: true,
			multiple: false
		})) as IImage;
		this.newAvatar = image.path;
	};
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000'
	} as ViewStyle,
	innerContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center'
	} as ViewStyle,
	avatar: {
		width: SCREEN_WIDTH * 0.6,
		height: SCREEN_WIDTH * 0.6,
		marginVertical: 12,
		borderColor: BACK_WHITE,
		borderWidth: 1
	} as ImageStyle
});
