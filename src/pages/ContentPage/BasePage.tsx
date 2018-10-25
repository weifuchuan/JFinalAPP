import { observer } from 'mobx-react/native';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { RightElementPressEvent, Toolbar } from 'react-native-material-ui';
import { baseUrl } from '@/kit/req';
import { BACK_WHITE, ICON_BLUE } from '@/themes/color';
import WebView from '@/components/WebView';
import Router from '@/router';

interface Props {
	onShare: () => void;
	onFavorite: () => void;
	onLike: () => void;
	openOnBrowser:()=>void; 
	html: string;
	centerElementInTopBar?: JSX.Element | string;
	favorited: boolean;
	favoriteCount: number;
	liked: boolean;
	likeCount: number;
	webviewHandler?: string;
	onWebViewEmit: (payload: any) => any;
}

@observer
export default class BasePage extends React.Component<Props> { 

	render() {
		return (
			<View style={styles.container}>
				<Toolbar
					leftElement={'arrow-back'}
					rightElement={{
						actions: [],
						menu: {
							labels: [
								`${this.props.favorited ? '已' : ''}收藏(${this.props.favoriteCount})`,
								`${this.props.liked ? '已' : ''}点赞(${this.props.likeCount})`,
								"在浏览器打开",
								'分享'
							],
							icon: 'menu'
						}
					}}
					centerElement={this.props.centerElementInTopBar ? this.props.centerElementInTopBar : ''}
					onLeftElementPress={() => Router.pop()}
					onRightElementPress={(e: RightElementPressEvent) => {
						switch (e.index) {
							case 0:
								this.props.onFavorite();
								break;
							case 1:
								this.props.onLike();
								break;
							case 2:
								this.props.openOnBrowser(); 
								break; 
							case 3:
								this.props.onShare();
								break;
						}
					}}
					style={{ container: { backgroundColor: ICON_BLUE } }}
				/>
				<View style={styles.content}  >
					<WebView
						source={{ html: this.props.html, baseUrl: `${baseUrl}` }}
						startInLoadingState={false} 
						handler={this.props.webviewHandler}
						on={this.props.onWebViewEmit}
						originWhitelist={[]}
						automaticallyAdjustContentInsets
					/>
				</View>
			</View>
		);
	} 
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: BACK_WHITE
	} as ViewStyle,
	content: {
		flex: 1
	} as ViewStyle
});
