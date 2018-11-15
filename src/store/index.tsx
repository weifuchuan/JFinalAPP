import Storage from 'react-native-storage';
import { AsyncStorage, NativeEventEmitter } from 'react-native';
import { Account, Remind, RemindList } from './types';
import { toJS, observable, runInAction, action } from 'mobx';
import { req } from './web';
import { retryDo } from '@/kit';
const cheerio: CheerioAPI = require('react-native-cheerio');

// global state store & event bus
export class Store extends NativeEventEmitter {
	@observable me: Account | null = null;
	reminds: RemindList = new RemindList();

	async saveMe() {
		if (this.me)
			await storage.save({
				key: 'me',
				data: toJS(this.me)
			});
	}

	async quit() {
		try {
			this.me = null;
			await storage.remove({ key: 'me' });
		} catch (e) {}
	}

	get localStorage(): Storage {
		return storage;
	}

	async init() { 
		this.onLogged(async () => {
			this.me && this.parseRemids(cheerio.load(await req.GET_HTML('/my')));
		});
		this.onLogout(() => {
			this.reminds.clear();
		});
		try {
			const me = await storage.load<Account>({ key: 'me' });
			console.log(me);
			const $ = cheerio.load(await retryDo(async () => await req.GET_HTML('/my'), 3));
			global.$ = $; 
			const avatar = $('div.user-info.clearfix > a > img').attr('src');
			const nickName = $('.nick-name').text().trim();
			console.log(avatar, nickName);
			let id = 0;
			if (me) {
				if (nickName === me.nickName.trim()) {
					// logged
					me.avatar = avatar.substring('/upload/avatar/'.length) + '?donotCache=' + new Date().getTime();
					runInAction(() => {
						this.me = observable(me);
					});
					this.parseRemids($);
				}
			} else if (avatar && nickName) {
				let res;
				if ((res = /\/\d+\./.exec(avatar))) {
					id = Number.parseInt(res[0].substring(1, res[0].length - 1));
					runInAction(() => {
						this.me = observable({
							id,
							avatar,
							nickName,
							userName: '',
							createAt: '',
							ip: '',
							likeCount: 0,
							sessionId: '',
							status: 0
						});
					});
					this.parseRemids($);
				}
			}
		} catch (err) {
			console.log(err);
		}
	}

	@action
	parseRemids($: CheerioStatic) {
		if ($('.remind-layer').length > 0) {
			$('.remind-layer > a').each((_, elem) => {
				try {
					let remind: Remind = { type: 'fans', text: '' };
					const href = $(elem).attr('href');
					remind.type = href.substring(href.lastIndexOf('/') + 1) as any;
					remind.text = $(elem).text().trim();
					this.reminds.push(observable(remind));
				} catch (e) {}
			});
		}
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

	readonly emitSelectHomeBottomNav = (active: 'project' | 'share' | 'feedback' | 'search' | 'me') => {
		this.emit('selectHomeBottomNav', active);
	};

	readonly onSelectHomeBottomNav = (
		listener: (active: 'project' | 'share' | 'feedback' | 'search' | 'me') => void
	) => {
		this.addListener('selectHomeBottomNav', listener);
	};

	readonly offSelectHomeBottomNav = (
		listener: (active: 'project' | 'share' | 'feedback' | 'search' | 'me') => void
	) => {
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

	readonly emitToReferMe = () => {
		this.emit('ToReferMe');
	};

	readonly onToReferMe = (listener: () => void) => {
		this.addListener('ToReferMe', listener);
	};

	readonly offToReferMe = (listener: () => void) => {
		this.removeListener('ToReferMe', listener);
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
