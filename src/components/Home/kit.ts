import CheerioAPI from 'cheerio';
const cheerio: CheerioAPI = require('react-native-cheerio');

export interface Item {
	id: number;
	avatar: string;
	title: string;
	content: string;
}

export function takeItems(html: string): { items: Item[]; currPage: number; totalPage: number } {
	let items: Item[] = [];
	let $ = cheerio.load(html);
	const itemList = $('body > div.jf-body-box.clearfix > div.jf-panel-box.jf-pull-left > div > ul.jf-panel-list');
	itemList.find('li').each((i, elem) => {
		const avatar = $(elem).find('div.jf-panel-img > a > img').attr('src');
		const title = $(elem).find('div.jf-panel-item > h3 > a').text();
		const content = $(elem).find('div.jf-panel-item > p').text();
		const href = $(elem).find('div.jf-panel-item > h3 > a').attr('href');
		const id = Number.parseInt(href.substring(href.lastIndexOf('/') + 1).trim());
		items.push({ id, avatar, title, content });
	});
	let currPage = 1;
	let totalPage = 1;
	let pageList = $('body > div.jf-body-box.clearfix > div.jf-panel-box.jf-pull-left > div > ul.jf-paginate ');
	if (pageList.length > 0) {
		currPage = Number.parseInt(pageList.find('.current-page').text());
		let pages = pageList.find('li').toArray();
		totalPage = Number.parseInt($(pages[pages.length - 2]).find('a').text());
		if ($(pages[pages.length - 1]).find('.current-page').length > 0) {
			totalPage = currPage;
		}
	}
	return { items, currPage, totalPage };
}

export function takeItems2(html: string): { items: IterableIterator<Item>; currPage: number; totalPage: number } {
	let items: IterableIterator<Item>;
	let $ = cheerio.load(html);
	const pageList = $('body > div.jf-body-box.clearfix > div.jf-panel-box.jf-pull-left > div > ul.jf-paginate ');
	const currPage = Number.parseInt(pageList.find('.current-page').text());
	const pages = pageList.find('li').toArray();
	let totalPage = Number.parseInt($(pages[pages.length - 2]).find('a').text());
	if ($(pages[pages.length - 1]).find('.current-page').length > 0) {
		totalPage = currPage;
	}
	items = (function*(): IterableIterator<Item> {
		const itemList = $('body > div.jf-body-box.clearfix > div.jf-panel-box.jf-pull-left > div > ul.jf-panel-list');
		let lis = itemList.find('li');
		for (; lis.length > 0; ) {
			const li = lis.first();
			lis = lis.next();
			const avatar = li.find('div.jf-panel-img > a > img').attr('src');
			const title = li.find('div.jf-panel-item > h3 > a').text();
			const content = li.find('div.jf-panel-item > p').text();
			const href = li.find('div.jf-panel-item > h3 > a').attr('href');
			const id = Number.parseInt(href.substring(href.lastIndexOf('/') + 1).trim());
			yield { id, avatar, title, content };
		}
	})();
	return { items, currPage, totalPage };
}
