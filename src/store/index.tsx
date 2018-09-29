import Storage from '../storage';
import { AsyncStorage, NativeEventEmitter } from 'react-native';
import { Account } from '../types';
import { toJS, observable } from 'mobx';
import { req } from './web';
const cheerio: CheerioAPI = require('react-native-cheerio');

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
