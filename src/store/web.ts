import { Ret } from './types'; 
import * as req from '@/kit/req';
export { req };

export async function login(userName: string, password: string, captcha: string, keepLogin: boolean): Promise<Ret> {
	try {
		const resp = await req.POST_FORM('/login/doLogin', {
			userName,
			password,
			captcha,
			keepLogin
		});
		const result = resp.data;
		if (result['state']) {
			if (result['state'] === 'ok') return Ret.ok().set('account', result['loginAccount']);
			else return Ret.fail().set('msg', result['msg']);
		} else {
			let msg = '';
			if (result['userNameMsg']) {
				msg += result['userNameMsg'] + '；';
			}
			if (result['passwordMsg']) {
				msg += result['passwordMsg'] + '；';
			}
			if (result['captchaMsg']) {
				msg += result['captchaMsg'] + '；';
			}
			if (msg) {
				msg = msg.slice(0, msg.length - 1) + '。';
			}
			return Ret.fail().set('msg', msg);
		}
	} catch (err) {
		return Ret.fail().set('msg', '网络异常');
	}
}

export async function reg(nickName: string, userName: string, password: string, captcha: string): Promise<Ret> {
	try {
		const resp = await req.POST_FORM('/reg/save', { nickName, userName, password, captcha });
		const result = resp.data;
		if (result['state']) {
			if (result['state'] === 'ok') return Ret.ok().set('msg', result['msg']);
			else return Ret.fail().set('msg', result['msg']);
		} else {
			let msg = '';
			if (result['nickNameMsg']) {
				msg += result['nickNameMsg'] + '；';
			}
			if (result['userNameMsg']) {
				msg += result['userNameMsg'] + '；';
			}
			if (result['passwordMsg']) {
				msg += result['passwordMsg'] + '；';
			}
			if (result['captchaMsg']) {
				msg += result['captchaMsg'] + '；';
			}
			if (msg) {
				msg = msg.slice(0, msg.length - 1) + '。';
			}
			return Ret.fail().set('msg', msg);
		}
	} catch (err) {
		console.error(err);
		return Ret.fail().set('msg', '网络异常');
	}
}

export async function updatePassword(oldPassword: string, newPassword: string): Promise<Ret> {
	try {
		const resp = await req.POST_FORM('/my/setting/updatePassword', { oldPassword, newPassword });
		const result = resp.data;
		if (result['state'] && result['state'] === 'ok') {
			return Ret.ok();
		} else {
			return Ret.fail().set('msg', result['msg']);
		}
	} catch (err) {
		return Ret.fail().set('msg', '网络异常');
	}
}

export async function reply(target: 'share' | 'feedback', articleId: number, replyContent: string): Promise<Ret> {
	try {
		const resp = await req.POST_FORM(`/${target}/saveReply`, { articleId, replyContent });
		const result = resp.data;
		if (result['state'] && result['state'] === 'ok') {
			return Ret.ok().set('replyItem', result['replyItem']);
		} else {
			return Ret.fail().set('msg', result['msg']);
		}
	} catch (err) {
		return Ret.fail().set('msg', '网络异常');
	}
}

export async function deleteReply(target: 'share' | 'feedback', id: number): Promise<Ret> {
	try {
		const resp = await req.GET(`/${target}/deleteReply`, { id });
		const result = resp.data;
		if (result['state'] && result['state'] === 'ok') {
			return Ret.ok();
		} else {
			return Ret.fail().set('msg', result['msg']);
		}
	} catch (err) {
		return Ret.fail().set('msg', '网络异常');
	}
}

export async function favorite(refType: string, refId: number, isAdd: boolean): Promise<Ret> {
	try {
		const resp = await req.GET('/favorite', { refType, refId, isAdd });
		const result = resp.data;
		if (result['state'] && result['state'] === 'ok') {
			return Ret.ok();
		} else {
			return Ret.fail().set('msg', result['msg']);
		}
	} catch (err) {
		return Ret.fail().set('msg', '网络异常');
	}
}

export async function like(refType: string, refId: number, isAdd: boolean): Promise<Ret> {
	try {
		const resp = await req.GET('/like', { refType, refId, isAdd });
		const result = resp.data;
		if (result['state'] && result['state'] === 'ok') {
			return Ret.ok();
		} else {
			return Ret.fail().set('msg', result['msg']);
		}
	} catch (err) {
		return Ret.fail().set('msg', '网络异常');
	}
}

export async function addArticle(
	target: 'share' | 'feedback' | 'project',
	title: string,
	content: string,
	project: number | string
) {
	try {
		const form = {} as any;
		form[`${target}.title`] = title;
		form[`${target}.content`] = content;
		if (target === 'project') form[`${target}.name`] = project;
		else form[`${target}.projectId`] = project;
		const resp = await req.POST_FORM(`/my/${target}/save`, form);
		const result = resp.data;
		if (result['state'] && result['state'] === 'ok') {
			return Ret.ok();
		} else {
			return Ret.fail().set('msg', result['msg']);
		}
	} catch (err) {
		return Ret.fail().set('msg', '网络异常(可能原因：使用了不支持的emoji表情)');
	}
}

export async function updateArticle(
	target: 'share' | 'feedback' | 'project',
	id: number,
	title: string,
	content: string,
	project: number | string
) {
	try {
		const form = {} as any;
		form[`${target}.id`] = id;
		form[`${target}.title`] = title;
		form[`${target}.content`] = content;
		if (target === 'project') form[`${target}.name`] = project;
		else form[`${target}.projectId`] = project;
		const resp = await req.POST_FORM(`/my/${target}/update`, form);
		const result = resp.data;
		if (result['state'] && result['state'] === 'ok') {
			return Ret.ok();
		} else {
			return Ret.fail().set('msg', result['msg']);
		}
	} catch (err) {
		return Ret.fail().set('msg', '网络异常(可能原因：使用了不支持的emoji表情)');
	}
}

export async function saveNewsFeedReply(newsFeedId: number, replyContent: string): Promise<Ret> {
	try {
		const resp = await req.POST_FORM('/my/saveNewsFeedReply', { newsFeedId, replyContent });
		const result = resp.data;
		if (result['state'] && result['state'] === 'ok') {
			return Ret.ok().set('replyItem', result.replyItem);
		} else {
			return Ret.fail().set('msg', result['msg']);
		}
	} catch (err) {
		return Ret.fail().set('msg', '网络异常');
	}
}
