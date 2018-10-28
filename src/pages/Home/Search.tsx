import { action, observable, runInAction } from 'mobx';
import { inject, observer } from 'mobx-react/native';
import React, { Component } from 'react';
import { Keyboard, StyleSheet, Text, TextInputProps, View, ViewStyle } from 'react-native';
import { Button } from 'react-native-material-ui';
import { retryDo } from '@/kit';
import { Store } from '@/store';
import { req } from '@/store/web';
import { BACK_WHITE } from '@/themes/color';
import { SCREEN_WIDTH } from '@/components/kit';
import RefreshListView, { RefreshState, RefreshStateType } from '@/components/RefreshListView';
import HTML from '@/components/RNRenderHTML';
import Touchable from '@/components/Touchable';
import Router from '@/router';
import getPlatformElevation from '@/components/getPlatformElevation';
const { SearchInput } = require('teaset');
const cheerio: CheerioAPI = require('react-native-cheerio');

interface Props {
	store?: Store;
}

interface SearchResult {
	title: string;
	profile: string;
	url: string;
}

@inject('store')
@observer
class Search extends Component<Props> {
	@observable searchKey = '';
	@observable refreshState: RefreshStateType = RefreshState.Idle;
	@observable searchResultList: SearchResult[] = [];
	@observable nextPageUrl = '';
	@observable inputing = false;

	render() {
		return (
			<View style={styles.container}>
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						paddingVertical: 10,
						borderTopWidth: 0,
						backgroundColor: '#FFF',
						...getPlatformElevation(4)
					}}
				>
					<SearchInput
						style={styles.searchInput}
						inputStyle={{ color: '#000', fontSize: 18 }}
						iconSize={15}
						onSubmitEditing={this.search}
						value={this.searchKey}
						placeholder="输入搜索关键字..."
						placeholderTextColor="#aaa"
						onChangeText={(text: string) => (this.searchKey = text)}
						{...{
							onEndEditing: this.search,
							clearButtonMode: 'always',
							onFocus: () => (this.inputing = true),
							onBlur: () => (this.inputing = false)
						} as TextInputProps}
					/>
					<Button text={'搜索'} onPress={this.search} style={{ container: { height: 32 } }} />
				</View>
				<View style={{ flex: 1 }}>
					<RefreshListView
						data={this.searchResultList.slice()}
						renderItem={({ item }) => {
							let type = '';
							if (/\/user/.test(item.url)) {
								type = '用户';
							} else if (/\/project/.test(item.url)) {
								type = '项目';
							} else if (/\/share/.test(item.url)) {
								type = '分享';
							} else if (/\/feedback/.test(item.url)) {
								type = '反馈';
							} else if (/\/doc/.test(item.url)) {
								type = '文档';
							}
							return (
								<Touchable
									onPress={() => {
										// 不是文档
										if (!/\/doc/.test(item.url)) {
											const uri = item.url.match(
												/\/((user)|(project)|(share)|(feedback))\/\d+/
											)![0];
											const type = uri.substring(1, uri.lastIndexOf('/'));
											const id = Number.parseInt(uri.match(/\d+/)![0]);
											if (type === 'user') Router.user(id);
											else Router.push(`${type}Page`, { id });
										} else {
											// 文档
											const uri = item.url.match(/\/doc.*$/)![0];
											Router.doc(uri);
										}
									}}
								>
									<View
										style={{
											paddingHorizontal: 10,
											paddingVertical: 10,
											backgroundColor: '#fff'
										}}
									>
										<HTML html={`<span>[${type}]&nbsp;</span>` + item.title} />
										<HTML
											html={item.profile}
											emSize={14}
											ptSize={1.3}
											baseFontStyle={{ fontSize: 14 }}
										/>
									</View>
								</Touchable>
							);
						}}
						refreshState={this.refreshState}
						onHeaderRefresh={this.onHeaderRefresh}
						onFooterRefresh={this.onFooterRefresh}
						keyExtractor={(_, index) => index.toString()}
						ListEmptyComponent={() => (
							<View
								style={{
									flex: 1,
									justifyContent: 'center',
									alignItems: 'center',
									marginTop: 20
								}}
							>
								<Text>无搜索结果</Text>
							</View>
						)}
						style={{ flex: 1 }}
						ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
						ListHeaderComponent={() => <View style={{ height: 10 }} />}
					/>
				</View>
			</View>
		);
	}

	search = async () => {
		Keyboard.dismiss();
		if (this.searchKey.trim() === '') {
			this.searchResultList.splice(0, this.searchResultList.length);
			this.refreshState = RefreshState.Idle;
		} else {
			this.onHeaderRefresh(RefreshState.HeaderRefreshing);
		}
	};

	@action
	onHeaderRefresh = async (refreshState: RefreshStateType) => {
		this.refreshState = refreshState;
		if (this.searchKey.trim() === '') {
			this.searchResultList.splice(0, this.searchResultList.length);
			this.refreshState = RefreshState.Idle;
			return;
		}
		const html = await retryDo(
			async () =>
				await req.GET_HTML_PC_REQUEST('https://cn.bing.com/search', {
					q: `site:www.jfinal.com ${this.searchKey.trim()}`
				}),
			3
		);
		const $ = cheerio.load(html);
		runInAction(async () => {
			this.searchResultList.splice(0, this.searchResultList.length);
			if (!this.parseResult($)) {
				if (this.searchResultList.length === 0) {
					const html = await retryDo(
						async () =>
							await req.GET_HTML_PC_REQUEST('https://cn.bing.com/search', {
								q: `site:www.jfinal.com ${this.searchKey.trim()}`
							}),
						3
					);
					const $ = cheerio.load(html);
					if (!this.parseResult($)) {
						this.refreshState = RefreshState.Idle;
						this.onFooterRefresh(RefreshState.FooterRefreshing);
					} else this.refreshState = RefreshState.Idle;
				} else {
					this.refreshState = RefreshState.Idle;
					this.onFooterRefresh(RefreshState.FooterRefreshing);
				}
			} else this.refreshState = RefreshState.Idle;
		});
	};

	@action
	onFooterRefresh = async (refreshState: RefreshStateType) => {
		this.refreshState = refreshState;
		if (this.nextPageUrl.trim() === '') {
			if (this.searchResultList.length === 0) this.refreshState = RefreshState.Idle;
			else this.refreshState = RefreshState.NoMoreData;
			return;
		}
		const html = await retryDo(async () => await req.GET_HTML_PC_REQUEST(this.nextPageUrl), 3);
		const $ = cheerio.load(html);
		if (!this.parseResult($)) {
			this.onFooterRefresh(RefreshState.FooterRefreshing);
		} else this.refreshState = RefreshState.Idle;
	};

	@action
	private parseResult = ($: CheerioStatic): boolean => {
		$('#b_results > li').each((index, elem) => {
			const titleAnchor = $(elem).find('h2 > a');
			const url = titleAnchor.attr('href');
			if (
				titleAnchor.text().trim() === '' ||
				!/www\.jfinal\.com/.test(url) ||
				!(
					/\/user\/\d+/.test(url) ||
					/\/project\/\d+/.test(url) ||
					/\/share\/\d+/.test(url) ||
					/\/feedback\/\d+/.test(url) ||
					/\/doc(\/\d+-\d+)?$/.test(url)
				)
			)
				return;
			const title = $(elem).find('h2').html()!;
			const profile = $('div > p').html()!;
			this.searchResultList.push(observable({ title, profile, url }));
		});
		this.nextPageUrl = '';
		const href = $('#b_results > li.b_pag > nav > ul > li:last-child > a').attr('href');
		if (href && /^\/search\?q/.test(href)) {
			this.nextPageUrl = 'https://cn.bing.com' + href;
		}
		return this.searchResultList.length > 6;
	};
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: BACK_WHITE
	} as ViewStyle,
	searchInput: {
		flex: 1,
		height: 32,
		marginLeft: 10
	} as ViewStyle
});

export default Search;
