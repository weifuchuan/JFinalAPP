import { Actions } from 'react-native-router-flux';

export default class Router {
	static home() {
		Actions.push('home');
	}
	static project() {
		Actions.jump('project');
	}
	static share() {
		Actions.jump('share');
	}
	static feedback() {
		Actions.jump('feedback');
	}
	static me() {
		Actions.jump('me');
	}
	static projectPage(id: number) {
		Actions.push('projectPage', { id });
	}
	static sharePage(id: number) {
		Actions.push('sharePage', { id });
	}
	static feedbackPage(id: number) {
		Actions.push('feedbackPage', { id });
	}
	static editArticle(type: 'share' | 'feedback'|"project",isEdit?:boolean,id?:number) {
		Actions.push('editArticle', { type,isEdit,id });
	}
	static login(replace: boolean = false) {
		if (replace) Actions.replace('login');
		else Actions.push('login');
	}
	static reg(replace: boolean = false) {
		if (replace) Actions.replace('reg');
		else Actions.push('reg');
	}
	static user(id: number) {
		Actions.push('user', { id });
	}
	static uploadAvatar() {
		Actions.push('uploadAvatar');
	}
	static updatePassword() {
		Actions.push('updatePassword');
	}
	static myArticles(type: 'feedback' | 'project' | 'share', accountId?: number) {
		Actions.push('myArticles', { type, accountId });
	}
	static pop() {
		Actions.pop();
	}
	static push(key: string, props?: any) {
		Actions.push(key, props);
	}
	static _ = Actions;
}
