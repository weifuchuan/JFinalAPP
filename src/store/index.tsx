import Storage from '../storage';
import { AsyncStorage, NativeEventEmitter } from 'react-native';
import { Account } from '../types';
import { toJS, observable } from 'mobx';
import { req } from './web';
const cheerio: CheerioAPI = require('react-native-cheerio');

// global state store & event bus
export class Store extends NativeEventEmitter {
	@observable me?: Account;

	async saveMe() {
		if (this.me)
			await storage.save({
				key: 'me',
				data: toJS(this.me)
			});
	}

	async quit() {
		try {
			this.me = undefined;
			await storage.remove({ key: 'me' });
		} catch (e) {}
	}

	get localStorage(): Storage {
		return storage;
	}

	/**
	 * pack event bus
	 */

	readonly emitEditArticleOk = (type: 'share' | 'feedback' | 'project') => {
		this.emit('editArticleOk', type);
	};

	readonly onEditArticleOk = (listener: (type: 'share' | 'feedback' | 'project') => void) => {
		this.addListener('editArticleOk', listener);
	};

	readonly offEditArticleOk = (listener: (type: 'share' | 'feedback' | 'project') => void) => {
		this.removeListener('editArticleOk', listener);
	};

	readonly emitSelectHomeBottomNav = (active: string) => {
		this.emit('selectHomeBottomNav', active);
	};

	readonly onSelectHomeBottomNav = (listener: (active: string) => void) => {
		this.addListener('selectHomeBottomNav', listener);
	};

	readonly offSelectHomeBottomNav = (listener: (active: string) => void) => {
		this.removeListener('selectHomeBottomNav', listener);
	};

	readonly emitMyReplyOk = () => {
		this.emit('myReplyOk');
	};

	readonly onMyReplyOk = (listener: () => void) => {
		this.addListener('myReplyOk', listener);
	};

	readonly offMyReplyOk = (listener: () => void) => {
		this.removeListener('myReplyOk', listener);
	};

	readonly emitLogged = () => {
		this.emit('logged');
	};

	readonly onLogged = (listener: () => void) => {
		this.addListener('logged', listener);
	};

	readonly offLogged = (listener: () => void) => {
		this.removeListener('logged', listener);
	};

	readonly emitLogout = () => {
		this.emit('Logout');
	};

	readonly onLogout = (listener: () => void) => {
		this.addListener('Logout', listener);
	};

	readonly offLogout = (listener: () => void) => {
		this.removeListener('Logout', listener);
	};
}

const store = new Store();
export default store;

const storage = new Storage({
	size: 100000000,
	storageBackend: AsyncStorage
});
declare var global: any;

global.storage = storage;

(async function init() {
	try {
		const me = await storage.load<Account>({ key: 'me' });
		if (me) {
			const resp = await req.GET('/my', null, {
				responseType: 'text'
			});
			const html = resp.data;
			const $ = cheerio.load(html);
			const avatar = $(
				'body > div.jf-body-box.clearfix > div.jf-sidebar-box.jf-pull-left > div.jf-sidebar.user-info-box > div.user-info.clearfix > a > img'
			).attr('src');
			if (
				avatar.includes(me.id.toString()) ||
				$(
					'body > div.jf-body-box.clearfix > div.jf-sidebar-box.jf-pull-left > div.jf-sidebar.user-info-box > div.user-info.clearfix > div > span.nick-name'
				)
					.text()
					.trim() === me.nickName
			) {
				// logged
				me.avatar = avatar.substring('/upload/avatar/'.length) + '?donotCache=' + new Date().getTime();
				store.me = observable(me);
			}
		}
	} catch (err) {}
})();
