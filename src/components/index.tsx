import { Toast } from 'antd-mobile-rn';
import { observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import * as React from 'react';
import { BackHandler } from 'react-native';
import { Actions, Router, Scene, SceneProps, Stack, Tabs } from 'react-native-router-flux';
import { Store } from '../store/index';
import EditArticle from './EditArticle';
import { BACK_WHITE, ICON_BLUE } from './base/color';
import StatusBar from './base/StatusBar';
import FeedbackPage from './ContentPage/Feedback';
import ProjectPage from './ContentPage/Project';
import SharePage from './ContentPage/Share';
import Home from './Home';
import Feedback from './Home/Feedback';
import Me from './Home/Me';
import Project from './Home/Project';
import Share from './Home/Share';
import Login from './Login';
import Reg from './Reg';
import User from './User';
import UploadAvatar from './UploadAvatar';
import UpdatePassword from './UpdatePassword';
import MyArticles from './MyArticles';
import MyFavorite from './MyFavorite';
import Friends from './Friends';
import Message from './Message';
import SendMessage from './Message/SendMessage';

@inject('store')
@observer
export default class App extends React.Component<{
	store?: Store;
}> {
	render() {
		return (
			<Router backAndroidHandler={this.doubleBackThenExit}>
				<Stack hideNavBar>
					<Tabs
						key={'home'}
						lazy={true}
						tabBarPosition={'bottom'}
						tabBarComponent={Home}
						hideNavBar
						{...({
							initial: true
						} as SceneProps) as any}
					>
						<Scene
							key={'project'}
							hideNavBar
							initial
							component={Project}
							onEnter={this.pushCommonStatusBarStyle}
							onExit={this.popStatusBarStyle}
						/>
						<Scene
							key={'share'}
							hideNavBar
							component={Share}
							share
							onEnter={this.pushCommonStatusBarStyle}
							onExit={this.popStatusBarStyle}
						/>
						<Scene
							key={'feedback'}
							hideNavBar
							component={Feedback}
							share
							onEnter={this.pushCommonStatusBarStyle}
							onExit={this.popStatusBarStyle}
						/>
						<Scene
							key={'me'}
							hideNavBar
							component={Me}
							share
							onEnter={this.pushUserBlueStatusBar}
							onExit={this.popStatusBarStyle}
						/>
					</Tabs>
					<Scene
						key={'projectPage'}
						component={ProjectPage}
						onEnter={this.pushArticleStatusBarStyle}
						onExit={this.popStatusBarStyle}
					/>
					<Scene
						key={'sharePage'}
						component={SharePage}
						onEnter={this.pushArticleStatusBarStyle}
						onExit={this.popStatusBarStyle}
					/>
					<Scene
						key={'feedbackPage'}
						component={FeedbackPage}
						onEnter={this.pushArticleStatusBarStyle}
						onExit={this.popStatusBarStyle}
					/>
					<Scene
						key={'editArticle'}
						component={EditArticle}
						onEnter={this.pushArticleStatusBarStyle}
						onExit={this.popStatusBarStyle}
					/>
					<Scene
						key={'login'}
						component={Login}
						onEnter={this.pushCommonStatusBarStyle}
						onExit={this.popStatusBarStyle}
					/>
					<Scene
						key={'reg'}
						component={Reg}
						onEnter={this.pushCommonStatusBarStyle}
						onExit={this.popStatusBarStyle}
					/>
					<Scene
						key={'user'}
						component={User}
						onEnter={(props: any) => {
							this.pushUserBlueStatusBar();
							if (this.props.store!.me && this.props.store!.me!.id === props.id) {
								Actions.jump('me');
								this.props.store!.emit('selectHomeBottomNav', 'me');
							}
						}}
						onExit={this.popStatusBarStyle}
					/>
					<Scene
						key={'uploadAvatar'}
						component={UploadAvatar}
						onEnter={(props: any) => {
							this.pushBlackStatusBarStyle();
							if (!this.props.store!.me) {
								Actions.login();
							}
						}}
						onExit={this.popStatusBarStyle}
					/>
					<Scene
						key={'updatePassword'}
						component={UpdatePassword}
						onEnter={(props: any) => {
							this.pushCommonStatusBarStyle();
							if (!this.props.store!.me) {
								Actions.login();
							}
						}}
						onExit={this.popStatusBarStyle}
					/>
					<Scene
						key={'myArticles'}
						component={MyArticles}
						onEnter={this.pushArticleStatusBarStyle}
						onExit={this.popStatusBarStyle}
					/>
					<Scene
						key={'myFavorite'}
						component={MyFavorite}
						onEnter={(props: any) => {
							this.pushArticleStatusBarStyle();
							if (!this.props.store!.me) {
								Actions.login();
							}
						}}
						onExit={this.popStatusBarStyle}
					/>
					<Scene
						key={'friends'}
						component={Friends}
						onEnter={this.pushArticleStatusBarStyle}
						onExit={this.popStatusBarStyle}
					/>
					<Scene
						key={'message'}
						component={Message}
						onEnter={this.pushArticleStatusBarStyle}
						onExit={this.popStatusBarStyle}
					/>
					<Scene
						key={'sendMessage'}
						component={SendMessage}
						onEnter={this.pushArticleStatusBarStyle}
						onExit={this.popStatusBarStyle}
					/>
				</Stack>
			</Router>
		);
	}

	private exit: boolean = false;
	private doubleBackThenExit = (): boolean => {
		const currentScene = (Actions.currentScene as string).substring(1);
		if (
			currentScene === 'project' ||
			currentScene === 'share' ||
			currentScene === 'feedback' ||
			currentScene === 'me'
		) {
			if (this.exit) {
				BackHandler.exitApp();
				return true;
			}
			this.exit = true;
			Toast.info('再按退出', 2, () => {
				this.exit = false;
			});
			return true;
		}
		return false;
	};

	private pushCommonStatusBarStyle = () => {
		StatusBar.pushBarStyle('dark-content');
		StatusBar.pushBackgroundColor(BACK_WHITE);
	};

	private pushUserBlueStatusBar = () => {
		StatusBar.pushBarStyle('light-content');
		StatusBar.pushBackgroundColor('#2196f3');
	};

	private pushArticleStatusBarStyle = () => {
		StatusBar.pushBarStyle('light-content');
		StatusBar.pushBackgroundColor(ICON_BLUE);
	};

	private pushBlackStatusBarStyle = () => {
		StatusBar.pushBarStyle('light-content');
		StatusBar.pushBackgroundColor('#000');
	};

	private popStatusBarStyle = () => {
		StatusBar.popBackgroundColor();
		StatusBar.popBarStyle();
	};

	componentDidMount() {}
}
