import { Toast } from 'antd-mobile-rn';
import { action, observable } from 'mobx';
import { inject, observer } from 'mobx-react/native';
import React from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, View, ViewStyle } from 'react-native';
import { Toolbar } from 'react-native-material-ui';
import { retryDo } from '../../kit';
import { Store } from '../../store';
import { addArticle, req, updateArticle } from '../../store/web';
import { ICON_BLUE } from '../base/color';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../base/kit';
import WebView from '../base/WebView';
import Router from '../Router';
const cheerio: CheerioAPI = require('react-native-cheerio');

interface Props {
	store?: Store;
	type: 'share' | 'feedback' | 'project';
	isEdit?: boolean;
	id?: number;
}

interface Draft {
	title: string;
	project: string | number;
	content: string;
}

@inject('store')
@observer
export default class AddArticle extends React.Component<Props> {
	@observable html = '';
	@observable loading = false;
	webview: WebView | null = null;
	readyFunctions: (() => void)[] = [];

	render() {
		return (
			<View style={styles.container}>
				<Toolbar
					leftElement={'arrow-back'}
					centerElement={`${this.props.isEdit ? '编辑' : '创建'}${this.props.type === 'share' ? '分享' : '反馈'}`}
					onLeftElementPress={async () => {
						await this.saveDraft();
						Router.pop();
					}}
					style={{ container: { backgroundColor: ICON_BLUE } }}
				/>
				<View style={{ flex: 1 }}>
					<WebView
						ref={(r) => (this.webview = r)}
						source={{ html: this.html, baseUrl: 'http://www.jfinal.com' }}
						on={this.onWebViewPostMsg}
						handler={this.webviewHandler}
					/>
				</View>
				<ActivityIndicator animating={this.loading} style={styles.loading} color={ICON_BLUE} />
			</View>
		);
	}

	onWebViewPostMsg = async (payload: any) => {
		if (payload.action === 'ready') {
			this.loading = false;
			for (let f of this.readyFunctions) f();
		} else if (payload.action === 'submit') {
			Toast.loading('保存中..', 0);
			const postToServer = this.props.isEdit ? updateArticle : addArticle;
			const ret = await postToServer(
				this.props.type,
				payload.article.title,
				payload.article.content,
				payload.article.project
			);
			Toast.hide();
			if (ret.isOk) {
				this.props.store!.localStorage.remove({ key: 'draft', id: this.props.type });
				this.props.store!.emitEditArticleOk( this.props.type);
				Router.pop();
			} else {
				Toast.fail(ret.get('msg'));
			}
		}
	};

	fetchArticle = async () => {
		if (this.loading)
			return await new Promise((resolve) => {
				this.readyFunctions.push(async () => {
					resolve(await this.webview!.post({ action: 'get' }));
				});
			});
		else return await this.webview!.post({ action: 'get' });
	};

	saveDraft = async () => {
		if (this.props.isEdit) return;
		const localStore = this.props.store!.localStorage;
		await localStore.save({ key: 'draft', id: this.props.type, data: await this.fetchArticle() });
	};

	loadDraft = async (draft?: Draft) => {
		const localStore = this.props.store!.localStorage;
		const f = async () => {
			try {
				if (draft) {
					this.webview!.post({ action: 'loadDraft', draft });
				} else {
					draft = await localStore.load({ key: 'draft', id: this.props.type });
					if (draft) this.webview!.post({ action: 'loadDraft', draft });
				}
			} catch (e) {}
		};
		if (this.loading) this.readyFunctions.push(f);
		else f();
	};

	webviewHandler = `function(msg){ 
		if (msg.action === 'get'){
			var title = $("#title").val().trim(); 
			var project = $("#project").val(); 
			var content = editor.getValue(); 
			if (project){
				project = Number.parseInt(project); 
			}
			return {title: title, project: project, content: content}; 
		}else if (msg.action === 'loadDraft'){
			$(document).ready(function(){
				var draft = msg.draft; 
				$("#title").val(draft.title);
				$("#project").val(draft.project.toString());
				editor.setValue(draft.content); 
			});
		}
	}`;

	htmlBuild(projects: [string, number][] = []) {
		return `
		<!DOCTYPE html>
		<html>
		<link href="https://cdn.bootcss.com/amazeui/2.7.2/css/amazeui.min.css" rel="stylesheet">
		<link href="https://cdn.bootcss.com/simditor/2.3.6/styles/simditor.min.css" rel="stylesheet">

		<script src="https://cdn.bootcss.com/jquery/2.2.4/jquery.min.js"></script>
		<script src="https://simditor.tower.im/assets/scripts/mobilecheck.js"></script>
		<style>
		
		</style>
		<body>

		<div class="am-form" >
			<fieldset  >
				${this.props.type === 'project'
					? `
				<div class="am-form-group">
					<label for="project">名称</label>
					<input type="text" class="" id="project">
				</div>
				`
					: ``}	
				<div class="am-form-group">
					<label for="title">标题</label>
					<input type="text" class="" id="title">
				</div>			
				${this.props.type === 'project'
					? ``
					: `
				<div class="am-form-group">
					<label for="project">关联项目</label>
					<select id="project">
						<option value="">请选择</option>
						${projects.reduce((prev, curr) => prev + `<option value="${curr[1]}">${curr[0]}</option>`, '')}
					</select>
					<span class="am-form-caret"></span>
				</div>
				`}				
				<div class="am-form-group">
					<label for="content">正文</label>
					<textarea id="content"></textarea>
				</div>          
				<button id="submit" class="am-btn am-btn-primary">提交</button>
			</fieldset>
		</div>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/simple-module/2.0.6/simple-module.js"></script>
		<script src="https://cdn.bootcss.com/mycolorway-simple-hotkeys/1.0.3/hotkeys.min.js"></script>
		<script src="https://cdn.bootcss.com/simditor/2.3.6/lib/simditor.min.js"></script>
		<script>
			$(document).ready(function () {
				try{
					window.editor = new Simditor({
						textarea: $('#content'),
						toolbar: [
							'title',
							'bold',
							'italic',
							'underline',
							'strikethrough',
							'fontScale',
							'color',
							'ol',
							'ul',
							'blockquote',
							'code',
							'table',
							'link',
							'image',
							'hr',
							'indent',
							'outdent',
							'alignment',
						], 
					});
				}catch(e){}
				setTimeout(function(){
					send({ action: "ready" }); 
				}, 300); 
				$("#submit").click(function(){ 
					var title = $("#title").val().trim(); 
					var project = $("#project").val().trim(); 
					var content = editor.getValue(); 
					if (title.length < 3 || title.length > 100){
						alert("标题长度要求在3到100个字符"); 
						return; 
					}
					if (!project){
						alert("请选择关联项目"); 
						return; 
					}
					if (${this.props.type !== 'project'})
						project = Number.parseInt(project); 
					send({action:"submit", article: { title: title, project: project, content: content }})
						.then(function(result){

						}); 
				}); 
			});
		</script>
		</body>
		</html>
		`;
	}

	componentDidMount() {
		action(async () => {
			this.loading = true;
			if (this.props.isEdit)
				try {
					const html = await retryDo(
						async () => await req.GET_HTML(`/my/${this.props.type}/edit?id=${this.props.id}`),
						3
					);
					const $ = cheerio.load(html);
					const draft: Draft = { title: '', content: '', project: '' };
					draft.title = $(`input[name="${this.props.type}.title"]`).attr('value');
					draft.content = $(`script[name="${this.props.type}.content"]`).html()!;
					if (this.props.type === 'project') {
						draft.project = $(`input[name="${this.props.type}.name"]`).attr('value');
						this.html = this.htmlBuild();
					} else {
						draft.project = Number.parseInt($('.related-project-name option[selected]').attr('value'));
						this.html = this.htmlBuild(
							$('.related-project-name').find('option').toArray().slice(1).map((elem): [
								string,
								number
							] => {
								return [ $(elem).text(), Number.parseInt($(elem).attr('value')) ];
							})
						);
					}
					this.loadDraft(draft);
				} catch (e) {
					Toast.fail('网络异常！');
				}
			else
				try {
					if (this.props.type === 'project') {
						this.html = this.htmlBuild();
					} else {
						const html = await retryDo(async () => await req.GET_HTML('/my/share/add'), 3);
						const $ = cheerio.load(html);
						this.html = this.htmlBuild(
							$('.related-project-name').find('option').toArray().slice(1).map((elem): [
								string,
								number
							] => {
								return [ $(elem).text(), Number.parseInt($(elem).attr('value')) ];
							})
						);
					}
					this.loadDraft();
				} catch (e) {
					Toast.fail('网络异常！');
				}
			// this.loading = false;
		})();
		BackHandler.addEventListener('hardwareBackPress', this.onBack);
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.onBack);
	}

	onBack = async () => {
		await this.saveDraft();
		Router.pop();
	};
}

const styles = StyleSheet.create({
	container: { flex: 1 } as ViewStyle,
	loading: {
		position: 'absolute',
		width: SCREEN_WIDTH,
		height: SCREEN_HEIGHT,
		justifyContent: 'center',
		alignItems: 'center'
	} as ViewStyle
});
