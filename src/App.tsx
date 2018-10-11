// import { req } from './store/web';
// import VersionNumber from 'react-native-version-number';
import { Modal } from 'antd-mobile-rn';
import { Provider } from 'mobx-react';
import * as React from 'react';
import { Alert, Linking, YellowBox } from 'react-native';
import _updateConfig from './../update.json';
import App from './components';
import store from './store';
import { req } from './store/web';
declare var global: any;

if (__DEV__) {
	console.ignoredYellowBox = [ 'Warning: isMounted(...) is deprecated', 'Require cycle' ];
	// ignore yellow box
	YellowBox.ignoreWarnings([ 'Warning: isMounted(...) is deprecated', 'Require cycle' ]);
	// debug network
	global.XMLHttpRequest = global.originalXMLHttpRequest ? global.originalXMLHttpRequest : global.XMLHttpRequest;
	global.FormData = global.originalFormData ? global.originalFormData : global.FormData;
	fetch;
	global.Blob = global.originalBlob ? global.originalBlob : global.Blob;
	global.FileReader = global.originalFileReader ? global.originalFileReader : global.FileReader;
}

const { appKey } = _updateConfig['android'];
const {
	isFirstTime,
	isRolledBack,
	packageVersion,
	currentVersion,
	checkUpdate,
	downloadUpdate,
	switchVersion,
	switchVersionLater,
	markSuccess
} = require('react-native-update');

export default class extends React.Component {
	render() {
		return (
			<Provider store={store}>
				<App />
			</Provider>
		);
	}

	componentWillMount() {
		if (isRolledBack) {
			Alert.alert('提示', '刚刚更新失败了, 版本被回滚.');
		}
	}

	componentDidMount() {
		try {
			this.checkUpdate();
		} catch (e) {}
		// console.warn(require('react-native-update'));
		if (!__DEV__) {
			try {
				(async () => {
					const html = await req.GET_HTML_PC_REQUEST('https://github.com/weifuchuan/JFinalAPP/releases');
					const $ = cheerio.load(html);
					const newVersion = $(
						'div.release-entry:nth-child(1) div.release-header > ul > li:nth-child(1) > a > span'
					);
					if (newVersion.length > 0) {
						if (packageVersion && packageVersion !== newVersion.text().trim()) {
							for (let elem of $('div.release-entry:nth-child(1) details ul > li').toArray()) {
								try {
									if (/\.apk$/.test($(elem).find('a').attr('href'))) {
										Modal.alert(
											'版本更新',
											`发现新版本"${newVersion.text().trim()}"(本机为${packageVersion})，是否更新？`,
											[
												{
													text: '更新',
													onPress: () => {
														Linking.openURL(
															`https://github.com${$(elem).find('a').attr('href')}`
														);
													}
												},
												{ text: '取消', onPress: () => null }
											]
										);
										break;
									}
								} catch (e) {}
							}
						}
					}
				})();
			} catch (e) {}
		}
	}

	checkUpdate = () => {
		checkUpdate(appKey)
			.then(
				(info: {
					expired: boolean; // true: 该应用包(原生部分)已过期，需要前往应用市场下载新的版本。
					upToDate: boolean; // true: 当前已经更新到最新，无需进行更新。
					update: boolean; // true: 当前有新版本可以更新。
					name: string;
					description: string;
					metaInfo: any;
					downloadUrl: string;
				}) => {
					if (info.expired) {
						Alert.alert('提示', '您的应用版本已更新, 请下载新的版本', [
							{
								text: '确定',
								onPress: () => {
									info.downloadUrl && Linking.openURL(info.downloadUrl);
								}
							},
							{
								text: '取消',
								onPress: () => {}
							}
						]);
					} else if (info.upToDate) {
						// Alert.alert('提示', '您的应用版本已是最新.');
					} else {
						Alert.alert('提示', '检查到新的版本' + info.name + ', 是否下载?\n' + info.description, [
							{
								text: '是',
								onPress: () => {
									this.doUpdate(info);
								}
							},
							{ text: '否' }
						]);
					}
				}
			)
			.catch((err: any) => {
				Alert.alert('提示', '更新失败.');
			});
	};

	doUpdate = (info: any) => {
		downloadUpdate(info)
			.then((hash: any) => {
				Alert.alert('提示', '下载完毕, 是否重启应用?', [
					{
						text: '是',
						onPress: () => {
							switchVersion(hash);
						}
					},
					{ text: '否' },
					{
						text: '下次启动时',
						onPress: () => {
							switchVersionLater(hash);
						}
					}
				]);
			})
			.catch((err: any) => {
				Alert.alert('提示', '更新失败.');
			});
	};
}

/*
simple update

(async () => {
				const html = await req.GET_HTML_PC_REQUEST('https://github.com/weifuchuan/JFinalAPP/releases');
				const $ = cheerio.load(html);
				const newVersion = $(
					'div.release-entry:nth-child(1) div.release-header > ul > li:nth-child(1) > a > span'
				);
				if (newVersion.length > 0) {
					if (VersionNumber.appVersion && VersionNumber.appVersion !== newVersion.text().trim()) {
						for (let elem of $('div.release-entry:nth-child(1) details ul > li').toArray()) {
							try {
								if (/\.apk$/.test($(elem).find('a').attr('href'))) {
									Modal.alert(
										'版本更新',
										`发现新版本"${newVersion.text().trim()}"(本机为${VersionNumber.appVersion})，是否更新？`,
										[
											{
												text: '更新',
												onPress: () => {
													Linking.openURL(
														`https://github.com${$(elem).find('a').attr('href')}`
													);
												}
											},
											{ text: '取消', onPress: () => null }
										]
									);
									break;
								}
							} catch (e) {}
						}
					}
				}
			})();

*/
