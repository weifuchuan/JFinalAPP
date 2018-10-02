import { observable, runInAction, action, toJS } from 'mobx';
import { inject, observer } from 'mobx-react/native';
import React, { Component } from 'react';
import { Keyboard, StyleSheet, View, ViewStyle, Text, ScrollView, TextInputProps } from 'react-native';
import { Button } from 'react-native-material-ui';
import { BACK_WHITE } from '../base/color';
import RefreshListView, { RefreshState } from '../base/RefreshListView';
import { RefreshStateType } from '../base/RefreshListView';
import { req } from '../../store/web';
import { Store } from '../../store';
import HTML from '../base/RNRenderHTML';
import Touchable from '../base/Touchable';
import { SCREEN_WIDTH, SCREEN_HEIGHT, measure } from '../base/kit';
import Router from '../Router';
import { retryDo } from '../../kit';
const { SearchInput } = require('teaset');
const cheerio: CheerioAPI = require('react-native-cheerio');
const getPlatformElevation = require('react-native-material-ui/src/styles/getPlatformElevation').default;

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
						backgroundColor: BACK_WHITE,
						...getPlatformElevation(4)
					}}
				>
					<SearchInput
						style={styles.searchInput}
						inputStyle={{ color: '#8a6d3b', fontSize: 18 }}
						iconSize={15}
						value={this.searchKey}
						placeholder="输入搜索关键字..."
						placeholderTextColor="#aaa"
						onChangeText={(text: string) => (this.searchKey = text.trim())}
						{...{
							onEndEditing: this.search,
							clearButtonMode: 'always',
							onFocus: () => (this.inputing = true),
							onBlur: () => (this.inputing = false)
						} as TextInputProps}
					/>
					<Button text={'搜索'} onPress={this.search} style={{ container: { height: 32 } }} />
				</View>
				<View style={{ flex: 1, backgroundColor: '#fff' }}>
					<RefreshListView
						data={this.searchResultList.slice()}
						renderItem={({ item }) => {
							return (
								<Touchable
									onPress={() => {
										// console.warn(item.url);
										const uri = item.url.match(/\/((user)|(project)|(share)|(feedback))\/\d+/)![0];
										const type = uri.substring(1, uri.lastIndexOf('/'));
										const id = Number.parseInt(uri.match(/\d+/)![0]);
										// console.warn({type,id})
										if (type === 'user') Router.user(id);
										else Router.push(`${type}Page`, { id });
									}}
								>
									<View style={{ paddingHorizontal: 10, paddingVertical: 10 }}>
										<HTML html={item.title} />
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
						ItemSeparatorComponent={() => (
							<View
								style={{
									height: 1,
									width: SCREEN_WIDTH - 20,
									marginHorizontal: 10,
									backgroundColor: '#aaaaaaaa'
								}}
							/>
						)}
						style={{ flex: 1, backgroundColor: '#fff' }}
					/>
				</View>
			</View>
		);
	}

	search = async () => {
		Keyboard.dismiss();
		if (this.searchKey.trim() === '') this.searchResultList.splice(0, this.searchResultList.length);
		else {
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
				await req.GET_HTML_COMMON('https://cn.bing.com/search', {
					q: `site:www.jfinal.com ${this.searchKey.trim()}`
				}),
			3
		);
		const $ = cheerio.load(html);
		runInAction(() => {
			this.searchResultList.splice(0, this.searchResultList.length);
			this.parseResult($);
		});
		this.refreshState = RefreshState.Idle;
	};

	@action
	onFooterRefresh = async (refreshState: RefreshStateType) => {
		this.refreshState = refreshState;
		if (this.nextPageUrl.trim() === '') {
			this.refreshState = RefreshState.NoMoreData;
			return;
		}
		const html = await req.GET_HTML_COMMON(this.nextPageUrl);
		const $ = cheerio.load(html);
		this.parseResult($);
		this.refreshState = RefreshState.Idle;
	};

	@action
	private parseResult = ($: CheerioStatic) => {
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
					/\/feedback\/\d+/.test(url)
				)
			)
				return;
			const title = $(elem).find('h2').html()!;
			const profile = $('div > p').html()!;
			this.searchResultList.push({ title, profile, url });
		});
		this.nextPageUrl = '';
		const href = $('#b_results > li.b_pag > nav > ul > li:last-child > a').attr('href');
		if (href && /^\/search\?q/.test(href)) {
			this.nextPageUrl = 'https://cn.bing.com' + href;
		}
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
		backgroundColor: BACK_WHITE,
		marginLeft: 10
	} as ViewStyle
});

export default Search;
